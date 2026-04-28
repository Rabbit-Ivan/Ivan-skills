/**
 * FlowUs Article Extractor v2
 *
 * Key improvements over v1:
 * - Tree-based extraction from content root (prevents duplication)
 * - FlowUs block type detection (callout, columns, code, etc.)
 * - Structured JSON output for AI-assisted Feishu formatting
 * - Image position tracking relative to content blocks
 * - Sidebar/navigation noise filtering
 * - Support for custom Playwright user data directory
 *
 * Usage:
 *   node extract-flowus.mjs <article-url> [output-dir] [options]
 *
 * Options:
 *   --launch-login     Open browser for manual login
 *   --headless         Run in headless mode (default: headed)
 *   --debug            Dump DOM structure for debugging
 *   --data-dir=<path>  Custom Playwright user data directory
 */

import { createRequire } from 'module';

const require = createRequire(process.cwd() + '/package.json');
const { chromium } = require('playwright');

import { writeFileSync, mkdirSync } from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';

// --- Argument parsing ---
const args = process.argv.slice(2);
const articleUrl = args.find(a => a.startsWith('http'));
const outputDir = args.find(a => !a.startsWith('http') && !a.startsWith('--')) || '.';
const launchLogin = args.includes('--launch-login');
const debug = args.includes('--debug');
const headless = args.includes('--headless');
const customDataDir = args.find(a => a.startsWith('--data-dir='))?.split('=')[1];

if (!articleUrl) {
  console.error('Usage: node extract-flowus.mjs <url> [output-dir] [options]');
  console.error('Options: --launch-login, --headless, --debug, --data-dir=<path>');
  process.exit(1);
}

const userDataDir = customDataDir || path.join(outputDir, '.playwright-data');
mkdirSync(outputDir, { recursive: true });

// --- Browser launch ---
async function launchBrowser() {
  return chromium.launchPersistentContext(userDataDir, {
    headless,
    viewport: { width: 1400, height: 900 },
    ignoreHTTPSErrors: true,
  });
}

// --- Login wait mode ---
async function waitForLogin(context) {
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://flowus.cn', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('READY: Browser launched. Please log in to FlowUs.');
  console.log('TARGET: ' + articleUrl);

  const interval = setInterval(() => console.log('ALIVE: ' + new Date().toLocaleTimeString()), 30000);
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, async () => {
      clearInterval(interval);
      await context.close().catch(() => {});
      process.exit(0);
    });
  }
  await new Promise(() => {});
}

// --- Main extraction ---
async function extractArticle(context) {
  const page = context.pages()[0] || await context.newPage();

  console.log('>> Navigating to article...');
  await page.goto(articleUrl, { waitUntil: 'networkidle', timeout: 60000 });
  console.log('>> Waiting for content to render...');
  await page.waitForTimeout(5000);

  // Check login requirement
  const needsLogin = await page.evaluate(() => {
    const text = document.body?.innerText || '';
    return (text.includes('登录') && text.includes('注册') && text.length < 1000)
      || text.includes('页面需要付费');
  });

  if (needsLogin) {
    console.log('ERROR: Login required. Run with --launch-login first.');
    await context.close();
    process.exit(2);
  }

  // Scroll to trigger lazy loading
  console.log('>> Scrolling to load all content...');
  let previousHeight = 0;
  for (let i = 0; i < 50; i++) {
    const currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    if (currentHeight === previousHeight && i > 3) break;
    previousHeight = currentHeight;
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);

  // --- Debug: dump DOM structure ---
  if (debug) {
    const domDump = await page.evaluate(() => {
      function dumpNode(el, depth = 0) {
        if (!el || !el.tagName) return '';
        const indent = '  '.repeat(depth);
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? '.' + el.className.split(/\s+/).filter(Boolean).slice(0, 3).join('.')
          : '';
        const blockId = el.getAttribute('data-block-id') ? `[block=${el.getAttribute('data-block-id').slice(0, 8)}]` : '';
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const bgInfo = (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') ? ` bg=${bg}` : '';
        const flex = style.display === 'flex' ? ' flex' : '';
        const textLen = el.innerText?.length || 0;
        let line = `${indent}<${tag}${id}${cls}${blockId}${bgInfo}${flex}> text=${textLen}\n`;
        if (depth < 6) {
          for (const child of el.children) {
            line += dumpNode(child, depth + 1);
          }
        }
        return line;
      }
      return dumpNode(document.body);
    });
    writeFileSync(path.join(outputDir, 'debug-dom.txt'), domDump, 'utf-8');
    console.log('>> Debug DOM dump saved to debug-dom.txt');
  }

  // --- Extract structured content ---
  console.log('>> Extracting structured content...');
  const result = await page.evaluate(() => {
    const blocks = [];
    const images = [];

    // --- Utility: extract leading emoji from text ---
    function extractEmoji(text) {
      const emojiRegex = /^[\s]*([\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FAFF}\u{200D}\u{2B50}\u{2705}\u{274C}\u{26A0}\u{2139}\u{1F4A1}\u{1F3AF}\u{1F381}\u{1F4DD}\u{2728}\u{1F680}\u{1F527}]+)[\s]*/u;
      const match = text.match(emojiRegex);
      return match ? { emoji: match[1], rest: text.slice(match[0].length) } : { emoji: null, rest: text };
    }

    // --- Utility: check for STRONG colored background in subtree (callout indicator) ---
    // FlowUs uses rgba with low alpha (0.1) for decorative tints on list items etc.
    // Real callouts typically have alpha >= 0.3 or solid rgb backgrounds.
    function findCalloutBg(el, depth = 0) {
      if (!el || depth > 4) return null;
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        // Check alpha for rgba colors — skip decorative tints (alpha < 0.25)
        const alphaMatch = bg.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
        if (alphaMatch && parseFloat(alphaMatch[1]) < 0.25) return null;

        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (m) {
          const [r, g, b] = [+m[1], +m[2], +m[3]];
          // Skip white, near-white, and gray backgrounds
          if (r > 245 && g > 245 && b > 245) return null;
          if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 220) return null;
          // Classify the color
          if (b > 200 && r < 230 && g > 200) return 'light-blue';
          if (g > 200 && r < 230 && b < 230) return 'light-green';
          if (r > 230 && g > 200 && b < 200) return 'light-yellow';
          if (r > 200 && b > 200 && g < 200) return 'light-purple';
          if (r > 220 && g < 200 && b < 200) return 'light-red';
          return 'colored';
        }
      }
      for (const child of el.children) {
        const found = findCalloutBg(child, depth + 1);
        if (found) return found;
      }
      return null;
    }

    // --- Find content root: .next-space-page-content (FlowUs specific) ---
    const contentRoot = document.querySelector('.next-space-page-content')
      || document.querySelector('article')
      || document.querySelector('#next-space-page')
      || document.querySelector('main');

    if (!contentRoot) {
      return { title: document.title, blocks: [], images: [], allPageImages: [], error: 'Content root not found' };
    }

    // --- Extract title from page header (not from content h1) ---
    const headerEl = document.querySelector('.page-header header')
      || document.querySelector('header[data-block-id]');
    const title = headerEl?.innerText?.trim() || document.title;

    // --- Extract cover image from page-header ---
    const coverImg = document.querySelector('.page-header img, .bg-cover img');
    if (coverImg) {
      const src = coverImg.src || coverImg.getAttribute('data-src') || '';
      if (src.startsWith('http')) {
        images.push({ src, alt: 'cover', position: 0 });
        blocks.push({ type: 'image', src, alt: 'cover' });
      }
    }

    // --- Utility: extract rich text preserving bold/code inline markers ---
    function extractRichText(el) {
      function walk(node) {
        if (node.nodeType === 3) return node.textContent; // text node
        if (node.nodeType !== 1) return '';
        const t = node.tagName.toLowerCase();
        if (t === 'br') return '\n';
        if (t === 'img') return '';
        const cls = (typeof node.className === 'string') ? node.className : '';
        const isBold = cls.includes('text-bold') || t === 'strong' || t === 'b';
        const isCode = cls.includes('text-code') || t === 'code';
        let s = '';
        for (const c of node.childNodes) s += walk(c);
        s = s.replace(/\n+$/, ''); // trim trailing newlines
        if (isBold && s.trim()) return `**${s.trim()}**`;
        if (isCode && s.trim()) return '`' + s.trim() + '`';
        return s;
      }
      // Find the text container (skip toolbar overlay divs)
      const textEl = el.querySelector('.whitespace-pre-wrap:not([class*="border-t"])') || el;
      return walk(textEl).trim();
    }

    // --- Process each direct child of content root ---
    for (const child of contentRoot.children) {
      const tag = child.tagName.toLowerCase();
      const style = getComputedStyle(child);
      const text = child.innerText?.trim() || '';

      // Skip invisible elements
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      // --- Images FIRST (before empty-text filter, since image blocks have no text) ---
      const img = child.querySelector('img');
      if (img) {
        const src = img.src || img.getAttribute('data-src') || '';
        if (src.startsWith('http') && !src.includes('avatar') && !src.includes('icon') && !src.includes('emoji') && !src.includes('logo')) {
          images.push({ src, alt: img.alt || '', position: blocks.length });
          blocks.push({ type: 'image', src, alt: img.alt || '' });
          const cleanText = text.replace(/[\u200B\s]/g, '');
          if (cleanText.length > 5) {
            blocks.push({ type: 'paragraph', content: extractRichText(child) });
          }
          continue;
        }
      }

      // --- Dividers: check height (FlowUs renders dividers as thin elements) ---
      if (!text || text.replace(/[\u200B\s]/g, '') === '') {
        const rect = child.getBoundingClientRect();
        if (rect.height > 0 && rect.height <= 8 && child.querySelector('[class*="border"]')) {
          blocks.push({ type: 'divider' });
        }
        continue; // skip empty blocks either way
      }

      // --- Headings: h1-h6 tags ---
      if (/^h[1-6]$/.test(tag)) {
        blocks.push({ type: 'heading', level: parseInt(tag[1]), content: extractRichText(child) });
        continue;
      }

      // --- HR ---
      if (tag === 'hr' || child.querySelector('hr')) {
        blocks.push({ type: 'divider' });
        continue;
      }

      // --- FlowUs code blocks: div with border-t border-grey6 child ---
      const codeDiv = child.querySelector('[class*="border-t"][class*="border-grey"]');
      if (codeDiv && codeDiv.classList.contains('whitespace-pre-wrap')) {
        blocks.push({ type: 'code-line', content: codeDiv.innerText.trim() });
        continue;
      }

      // --- Standard pre/code blocks (fallback) ---
      const pre = child.querySelector('pre');
      if (pre) {
        const codeEl = pre.querySelector('code') || pre;
        const lang = (codeEl.className || '').match(/language-(\w+)/)?.[1] || '';
        blocks.push({ type: 'code', language: lang, content: codeEl.innerText });
        continue;
      }

      // --- FlowUs list items: block-has-icon-container ---
      const iconContainer = child.querySelector('.block-has-icon-container');
      if (iconContainer) {
        const iconArea = iconContainer.querySelector('.flex.items-start');
        const contentArea = iconContainer.querySelector('.whitespace-pre-wrap.self-start, .whitespace-pre-wrap.flex-1');
        const itemContent = contentArea ? extractRichText(contentArea.parentElement) : extractRichText(child);
        // Detect ordered vs unordered: check if icon area has number text via pseudo-element
        const iconText = iconArea?.innerText?.trim() || '';
        const isOrdered = /^\d+\.?$/.test(iconText);
        blocks.push({ type: 'list-item', ordered: isOrdered, content: itemContent });
        continue;
      }

      // --- Tables: look for table inside ---
      const table = child.querySelector('table');
      if (table) {
        const rows = [];
        for (const tr of table.querySelectorAll('tr')) {
          rows.push(Array.from(tr.querySelectorAll('td, th')).map(c => c.innerText.trim()));
        }
        if (rows.length > 0) blocks.push({ type: 'table', rows });
        continue;
      }

      // --- Lists: standard ul/ol fallback ---
      const listEl = child.querySelector('ul, ol');
      if (listEl && listEl.querySelectorAll('li').length > 0) {
        const items = Array.from(listEl.querySelectorAll(':scope > li')).map(li => extractRichText(li));
        blocks.push({ type: 'list', ordered: listEl.tagName.toLowerCase() === 'ol', items });
        continue;
      }

      // --- Blockquote ---
      const bq = child.querySelector('blockquote');
      if (bq) {
        blocks.push({ type: 'blockquote', content: extractRichText(bq) });
        continue;
      }

      // --- Callout detection: check for colored background in subtree ---
      // Only check the FIRST child (second child is usually FlowUs's hover toolbar)
      const firstChild = child.children[0];
      if (firstChild && text.length > 5) {
        const bgColor = findCalloutBg(firstChild, 0);
        if (bgColor) {
          const { emoji, rest } = extractEmoji(text);
          blocks.push({ type: 'callout', color: bgColor, emoji, content: rest || text });
          continue;
        }
      }

      // --- Default: paragraph with rich text ---
      blocks.push({ type: 'paragraph', content: extractRichText(child) });
    }

    // --- Post-process inside evaluate: merge consecutive list-item and code-line blocks ---
    const merged = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];

      // Merge consecutive list-items into a single list block
      if (b.type === 'list-item') {
        const items = [b.content];
        const ordered = b.ordered;
        while (i + 1 < blocks.length && blocks[i + 1].type === 'list-item' && blocks[i + 1].ordered === ordered) {
          i++;
          items.push(blocks[i].content);
        }
        merged.push({ type: 'list', ordered, items });
        continue;
      }

      // Merge consecutive code-lines into a single code block
      if (b.type === 'code-line') {
        const lines = [b.content];
        while (i + 1 < blocks.length && blocks[i + 1].type === 'code-line') {
          i++;
          lines.push(blocks[i].content);
        }
        merged.push({ type: 'code', language: '', content: lines.join('\n') });
        continue;
      }

      merged.push(b);
    }

    // --- Collect all content images from page (as fallback for position matching) ---
    const allPageImages = [...new Set(
      Array.from(document.querySelectorAll('img'))
        .map(img => img.src || img.getAttribute('data-src'))
        .filter(Boolean)
        .filter(src =>
          src.startsWith('http') &&
          !src.includes('avatar') && !src.includes('icon') &&
          !src.includes('emoji') && !src.includes('logo') &&
          !src.includes('menu_item') && !src.includes('wechat_btn')
        )
    )];

    return { title, blocks: merged, images, allPageImages };
  });

  // --- Post-process: generate clean Markdown ---
  console.log('>> Generating clean Markdown...');
  let markdown = '';

  // Skip h1 in body (use as document title separately)
  let skipFirstH1 = true;

  for (const block of result.blocks) {
    switch (block.type) {
      case 'heading':
        if (block.level === 1 && skipFirstH1) { skipFirstH1 = false; break; }
        markdown += '#'.repeat(block.level) + ' ' + block.content + '\n\n';
        break;

      case 'paragraph':
        markdown += block.content + '\n\n';
        break;

      case 'callout':
        markdown += `<!-- CALLOUT: color=${block.color}${block.emoji ? ' emoji=' + block.emoji : ''} -->\n`;
        markdown += block.content + '\n';
        markdown += '<!-- /CALLOUT -->\n\n';
        break;

      case 'columns':
        markdown += `<!-- COLUMNS: ${block.count} -->\n`;
        block.columns.forEach((col, i) => {
          markdown += `<!-- COLUMN: ${i + 1} -->\n`;
          for (const cb of col) {
            if (cb.type === 'paragraph') markdown += cb.content + '\n\n';
            else if (cb.type === 'heading') markdown += '#'.repeat(cb.level) + ' ' + cb.content + '\n\n';
            else if (cb.type === 'list') {
              cb.items.forEach((item, j) => {
                markdown += (cb.ordered ? `${j + 1}. ` : '- ') + item + '\n';
              });
              markdown += '\n';
            }
            else if (cb.type === 'callout') {
              markdown += `<!-- CALLOUT: color=${cb.color}${cb.emoji ? ' emoji=' + cb.emoji : ''} -->\n`;
              markdown += cb.content + '\n';
              markdown += '<!-- /CALLOUT -->\n\n';
            }
            else if (cb.type === 'image') {
              markdown += `<!-- IMAGE: ${cb.src} -->\n\n`;
            }
            else if (cb.type === 'code') {
              markdown += '```' + (cb.language || '') + '\n' + cb.content + '\n```\n\n';
            }
          }
        });
        markdown += '<!-- /COLUMNS -->\n\n';
        break;

      case 'image':
        markdown += `<!-- IMAGE: ${block.src} -->\n\n`;
        break;

      case 'code':
        markdown += '```' + (block.language || '') + '\n' + block.content + '\n```\n\n';
        break;

      case 'table':
        if (block.rows.length > 0) {
          block.rows.forEach((row, i) => {
            markdown += '| ' + row.join(' | ') + ' |\n';
            if (i === 0) markdown += '| ' + row.map(() => '---').join(' | ') + ' |\n';
          });
          markdown += '\n';
        }
        break;

      case 'list':
        block.items.forEach((item, i) => {
          markdown += (block.ordered ? `${i + 1}. ` : '- ') + item + '\n';
        });
        markdown += '\n';
        break;

      case 'blockquote':
        markdown += '> ' + block.content.split('\n').join('\n> ') + '\n\n';
        break;

      case 'divider':
        markdown += '---\n\n';
        break;
    }
  }

  // --- Get raw text as backup ---
  const rawText = await page.evaluate(() => {
    const main = document.querySelector('[class*="page-content"]') || document.querySelector('main') || document.body;
    return main?.innerText || '';
  });

  // --- Save all outputs ---
  writeFileSync(path.join(outputDir, 'article.md'), markdown.trim(), 'utf-8');
  writeFileSync(path.join(outputDir, 'article-raw.txt'), rawText, 'utf-8');
  writeFileSync(path.join(outputDir, 'structured.json'), JSON.stringify({
    title: result.title,
    blocks: result.blocks,
    images: result.images,
    allPageImages: result.allPageImages,
    sourceUrl: articleUrl,
    extractedAt: new Date().toISOString(),
  }, null, 2), 'utf-8');
  writeFileSync(path.join(outputDir, 'images.json'), JSON.stringify(result.allPageImages, null, 2), 'utf-8');

  console.log(`>> Title: ${result.title}`);
  console.log(`>> Blocks: ${result.blocks.length} (callout: ${result.blocks.filter(b => b.type === 'callout').length}, columns: ${result.blocks.filter(b => b.type === 'columns').length}, image: ${result.blocks.filter(b => b.type === 'image').length})`);
  console.log(`>> Markdown: ${markdown.length} chars`);
  console.log(`>> Images (in article): ${result.images.length}`);
  console.log(`>> Images (all page): ${result.allPageImages.length}`);

  // --- Download images ---
  const imageUrls = result.allPageImages;
  if (imageUrls.length > 0) {
    const imgDir = path.join(outputDir, 'images');
    mkdirSync(imgDir, { recursive: true });
    console.log(`>> Downloading ${imageUrls.length} images...`);

    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const ext = url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)?.[1] || 'png';
      const filename = `image-${i + 1}.${ext}`;
      const filepath = path.join(imgDir, filename);
      try {
        const getter = url.startsWith('https') ? https : http;
        await new Promise((resolve, reject) => {
          const req = getter.get(url, { rejectUnauthorized: false }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              getter.get(res.headers.location, { rejectUnauthorized: false }, (res2) => {
                const chunks = [];
                res2.on('data', c => chunks.push(c));
                res2.on('end', () => { writeFileSync(filepath, Buffer.concat(chunks)); resolve(); });
              }).on('error', reject);
              return;
            }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => { writeFileSync(filepath, Buffer.concat(chunks)); resolve(); });
          });
          req.on('error', reject);
        });
        console.log(`   [${i + 1}/${imageUrls.length}] ${filename}`);
      } catch (e) {
        console.log(`   [${i + 1}/${imageUrls.length}] ${filename} FAILED: ${e.message}`);
      }
    }
  }

  await context.close();
  console.log('>> Done!');
  return result;
}

// --- Entry point ---
const context = await launchBrowser();
if (launchLogin) {
  await waitForLogin(context);
} else {
  await extractArticle(context);
}
