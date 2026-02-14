---
name: benzenith-frontend-design2
description: BenZenith 官网“设计稿范式复刻”专用前端设计 skill。强制遵循 BenZenith 的东方极简 + 珠宝展陈质感 + 水墨结构性视觉 + 黑金点睛；并固化 PC 端尺寸规范、页面模板（首页/系列页/单品页/品牌故事/展览页）、CTA 默认形态（editorial link）、超大品牌签名 footer 等，输出 production-grade 代码（Next.js/React/Tailwind/HTML/CSS）与可执行的设计决策清单，避免通用模板化“AI slop”。
---

# BenZenith Frontend Design v2 (Spec-Driven)

## Mandatory references (read in this order)
1) `references/brand-tokens.md`
2) `references/layout-specs-pc.md`
3) `references/page-templates.md`
4) `references/ui-recipes.md`
5) `references/ink-backgrounds.md`
6) `references/copy-style.md`

## Non-negotiable design intent
- 固定风格：东方极简（留白、克制）+ 珠宝展陈（gallery / editorial）+ 水墨为结构性构图 + 黑金与温润中性色体系。
- 禁止风格漂移：SaaS dashboard、彩色渐变大面积铺底、糖果色、过度圆角、过度拟物/玻璃态、随意堆叠组件库模板。

## Primary goal
- 当用户提供“页面类型/模块/设计稿/截图/参考链接”时：以 `page-templates.md` 为结构基线，按 `layout-specs-pc.md` 的 PC 尺寸与排版锁定，再用 tokens + recipes 完成高还原实现。
- 当用户只给文字需求：仍必须选定一个页面模板（首页/系列/单品/故事/展览）并声明采用哪一个模板。

## Workflow (always follow)
1) Identify page type + template
- 明确：页面类型（Home / Series landing / Product detail / Brand story / Exhibition）
- 列出：模块清单（Header / Hero / Intro / Grid / Editorial / Footer signature 等）

2) Lock the spec
- 先锁：PC baseline 尺寸（1920 画布、各 section 高度、标题/正文高度、关键间距）
- 再锁：Typography（中英混排规则）与 CTA 默认形态（editorial link）

3) Produce production-grade output
- 输出可运行代码，包含响应式（desktop-first 但必须给出移动端折叠策略）。
- 强制可访问性：对比度、键盘导航、focus states、语义化标签、图片 alt。

4) Quality bar (self-check before final)
- 是否使用了正确模板与模块顺序？
- 是否遵循了 PC 尺寸与关键间距？
- CTA 是否默认是 editorial link（而不是随手一个大按钮）？
- Footer 是否包含“超大 BenZenith 签名区”模块？
- 水墨/纹理是否克制、低对比、不抢产品主体？

## Output contract (what to deliver)
你必须同时输出以下内容（除非用户明确不要）：
1) 设计决策摘要（<= 10 条，直接可执行）
2) 关键 tokens（CSS variables 或 Tailwind theme 扩展片段）
3) 页面/组件代码（完整、可运行）
4) 响应式策略（用简短要点说明断点与折叠方式）

## What to avoid
- 避免泛泛解释、避免“看起来很高级但不符合 BenZenith”的视觉发散。
- 避免引入过多装饰性 icon、复杂卡片堆叠、过度阴影与过度动效。
