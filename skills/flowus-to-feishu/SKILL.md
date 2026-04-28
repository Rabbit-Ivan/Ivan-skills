---
name: flowus-to-feishu
description: >-
  将 FlowUs 文章迁移到飞书云文档/知识库。当用户提供 FlowUs 链接并要求迁移到飞书时使用。
  也适用于用户提到 FlowUs 迁移、FlowUs 转飞书、文章搬运到飞书、FlowUs 文档导入飞书等场景。
  即使用户只说“帮我把这篇 FlowUs 迁移过来”，也应触发此 skill。
---

# FlowUs → 飞书文档迁移

将 FlowUs 平台的文章（包括付费内容）迁移到飞书云文档或知识库，保留完整的文本结构、图片和代码示例。

## 前置依赖

- Playwright（`npm install playwright`，项目目录需已安装）
- `lark-cli`（飞书 CLI 工具，需已完成 `config init` 和 `auth login`）
- `lark-doc` skill（用于创建和更新飞书文档）
- `lark-wiki` skill（用于知识库节点操作）

## 核心原则（从实战中总结）

### 1. 忠于原文结构，不要过度美化
- **不要自作主张改变原文的布局方式**。如果 FlowUs 原文是垂直排列的 ❌/✅ 对比，就用垂直排列，不要硬塞进 `<grid cols="2">` 双栏
- 只有 FlowUs 原文本身就是并列展示的内容，才在飞书中使用 `<grid>` 分栏
- Callout 只用于原文中明确有特殊强调的内容（课程目标、总结、注意事项等），不要随意给普通段落加 callout

### 2. 代码块需要从 raw text 补全
- **已知脚本限制**：FlowUs 代码块使用特殊渲染，脚本提取时 `content` 经常为空字符串
- **必须检查**：提取后查看 `structured.json`，如果发现 `type: "code"` 且 `content: ""`，必须回到 `article-raw.txt` 手工提取代码内容
- **raw text 中代码块的格式**：以 `Markdown\n复制\n` 开头，后面是带行号的内容（`1\n第一行\n2\n第二行\n...`），需要去掉行号和 "Markdown\n复制" 前缀

### 3. 写入飞书时的 shell 安全
- **严禁**在 `--markdown` 参数中直接使用 HEREDOC（`$(cat <<'EOF'...EOF)`），会导致 shell 语法泄漏到文档中产生乱码
- **正确做法**：先将 Markdown 内容写入临时文件，再用 `$(cat /path/to/file.md)` 传给 `--markdown`
- 每个分段内容都写到独立的临时 `.md` 文件中

### 4. 迁移后必须深度对比验证
- 逐段对比 FlowUs raw text 和飞书文档内容，检查每个章节、每个代码块、每张图片
- 特别注意：代码示例、文末任务/总结、封面图——这些最容易遗漏
- 用脚本自动检查关键字是否在飞书文档中存在

## 批量迁移工作流（推荐）

### Phase 1：接收输入

用户提供：
- **多个 FlowUs 文章 URL**
- **飞书目标位置**（知识库 wiki URL 或文件夹 URL）

如果用户只给了源链接没给目标，主动询问：
> "请问要迁移到飞书的哪个位置？给我知识库或文件夹的链接"

### Phase 2：提取内容

对每个 FlowUs URL，运行提取脚本：

```bash
node /Users/ivan/.agents/skills/flowus-to-feishu/scripts/extract-flowus.mjs "<flowus-url>" "<output-dir>" --data-dir=/Users/ivan/Downloads/wenqing-work/.playwright-data
```

**重要**：
- `--data-dir` 指向用户已有的 Playwright 持久化登录数据目录
- 如果脚本以 exit code 2 退出（需要登录），告知用户用 `--launch-login` 重新登录
- 每篇文章使用独立的输出目录（如 `migration/article-1/`）

### Phase 3：检查提取质量 + 补全空代码块

提取完成后，**必须执行以下检查**：

1. 读取 `structured.json`，统计 block 类型分布
2. **检查所有 `type: "code"` 的 block**，如果 `content` 为空：
   - 打开 `article-raw.txt`
   - 搜索对应位置的代码内容（特征：`Markdown\n复制\n` 后跟带行号的代码）
   - 手工提取实际代码内容（去掉 `Markdown`、`复制`、行号前缀）
3. 检查图片数量是否合理（封面图 + 内容图）
4. 检查文末是否有"练习任务"、"总结"、"下一步"等结尾内容

### Phase 4：组装飞书 Markdown

按以下规则将内容转换为飞书 Lark-flavored Markdown：

**标题**：`## 标题内容`（跳过 h1，飞书文档标题由 `--title` 设置）

**段落**：直接输出文本，保留 `**粗体**` 标记

**Callout 高亮块**（仅用于课程目标、总结、重要提示等明确需要强调的内容）：
```markdown
<callout emoji="dart" background-color="light-blue">
**课程目标**：内容文本
</callout>
```

**图片**（使用 CDN URL 内联）：
```markdown
<image url="CDN-URL" width="800" align="center"/>
```

**代码块**：
````markdown
```bash
代码内容
```
````

**列表**：标准 Markdown `- item` 或 `1. item`

**引用**：`> 引用内容`

**分割线**：`---`

**Grid 分栏**（仅当原文确实是并列展示时才使用）：
```markdown
<grid cols="2">
<column>
第一列内容
</column>
<column>
第二列内容
</column>
</grid>
```

### Phase 5：分段写入飞书

1. 按章节边界将飞书 Markdown 切成多个文件（每段 2000-4000 字符）
2. 每段内容写入独立的临时 `.md` 文件
3. 第一段用 `docs +create` 创建文档
4. 后续段落用 `docs +update --mode append` 逐段追加
5. **传参方式**：`--markdown "$(cat /path/to/partN.md)"`，不要用 HEREDOC

```bash
# 创建文档（第一段）
CONTENT=$(cat migration/article-1/feishu-part1.md)
lark-cli docs +create --title "文章标题" --wiki-node <wiki-token> --markdown "$CONTENT" --as user

# 追加后续段落
CONTENT=$(cat migration/article-1/feishu-part2.md)
lark-cli docs +update --doc <doc-id> --mode append --markdown "$CONTENT" --as user
```

**分段切割原则**：
- 按章节（h2/h3 标题）自然分段
- callout 和 grid 标签必须完整，不能跨段切割
- 图片 `<image>` 标签跟随其所在的文本段落

### Phase 6：深度对比验证

**必须在每篇文章迁移后执行**：

1. 拉取飞书文档内容：`lark-cli docs +fetch --doc <doc-id> --as user`
2. 逐段与 `article-raw.txt` 对比，检查：
   - 每个标题是否存在
   - 每个代码示例是否完整（内容不为空）
   - 每张图片是否插入
   - 文末结尾内容（练习任务/总结/下一步）是否存在
   - 整体段落数是否大致匹配
3. 如发现遗漏，用 `docs +update --mode insert_after/insert_before/append` 补入
4. 修复后再次拉取验证，确认无遗漏

### Phase 7：交付

输出汇总表：

| 序号 | 原文标题 | 飞书文档链接 | 章节 | 图片 | 代码块 | 状态 |
|------|---------|-------------|------|------|--------|------|
| 1 | xxx | https://... | 5 | 3 | 8 | ✅ |

## 提取脚本说明

**脚本路径**：`/Users/ivan/.agents/skills/flowus-to-feishu/scripts/extract-flowus.mjs`

**用法**：
```bash
node <script> <flowus-url> [output-dir] [options]
```

**选项**：
- `--data-dir=<path>` — 指定 Playwright 用户数据目录（复用登录态）
- `--launch-login` — 打开浏览器供用户手动登录
- `--headless` — 无头模式运行
- `--debug` — 输出 DOM 结构到 debug-dom.txt 供调试

**输出文件**：
- `article.md` — 带注释标记的 Markdown
- `structured.json` — 结构化 JSON（blocks 数组）
- `article-raw.txt` — 原始文本备份（**代码块补全的关键数据源**）
- `images.json` — 图片 URL 列表
- `images/` — 下载的图片文件

**block 类型**：
- `heading` — 标题（level + content，content 保留 `**粗体**`）
- `paragraph` — 段落（content 保留 `**粗体**` 和 `` `行内代码` ``）
- `list` — 列表（ordered + items 数组，items 保留粗体）
- `code` — 代码块（language + content，**content 可能为空，需从 raw text 补**）
- `image` — 图片（src + alt，第一张可能是封面图 alt="cover"）
- `callout` — 高亮块（color + emoji + content，仅在 alpha >= 0.25 时触发）
- `table` — 表格（rows 二维数组）
- `divider` — 分割线
- `blockquote` — 引用

### 已知脚本限制

1. **代码块内容提取失败**：FlowUs 代码块使用 `border-t border-grey6` 样式的 div 渲染，脚本用 `innerText` 经常取到空值。**必须从 `article-raw.txt` 手工补全**
2. **FlowUs CDN 图片有时效 token**：提取后应尽快使用，过期后需改用 `docs +media-insert` 上传本地图片
3. **callout 检测保守**：FlowUs 大量使用 `rgba(x,x,x, 0.1)` 装饰背景，脚本已过滤 alpha < 0.25，但真正的 callout 仍由 AI 在转换阶段根据内容语义判断

## 注意事项

- FlowUs 是纯 SPA 应用，不能只用 curl 或普通网页抓取，必须用 Playwright
- 飞书文档 Markdown 中不支持标准 `![alt](url)` 图片语法，必须用 `<image url="..." />` 标签
- 使用 `--as user` 身份操作飞书，确保文档归属用户本人
- 用户的 Playwright 登录数据在 `/Users/ivan/Downloads/wenqing-work/.playwright-data/`，始终用 `--data-dir` 指向此路径

## FlowUs DOM 调试

如果提取结果不理想，运行 `--debug` 模式：
```bash
node <script> "<url>" "<output-dir>" --debug --data-dir=/Users/ivan/Downloads/wenqing-work/.playwright-data
```

FlowUs DOM 关键结构（2026-04 实测）：
- 内容根容器：`div.next-space-page-content`（`<article>` 内部）
- 文档标题：`<header>` 标签在 `.page-header` 内（不是内容区的 h1）
- 封面图：`.page-header .bg-cover img`
- 每个内容 block：`<section data-block-id="xxx">` 或 `<div class="relative">`
- 列表项特征：子元素含 `block-has-icon-container` class
- 代码块特征：子元素含 `border-t border-grey6` class
- 粗体：`<span class="text-bold">` + fontWeight 600
- 装饰背景：`rgba(2, 133, 255, 0.1)`（alpha=0.1，不是 callout）
