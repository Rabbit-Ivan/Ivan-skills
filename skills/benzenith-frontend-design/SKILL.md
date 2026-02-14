---
name: benzenith-frontend-design
description: BenZenith 品牌专用前端设计与UI实现规范。用于生成或优化 BenZenith 官网/落地页/活动页/电商页面/组件（React/Next.js/HTML/CSS/Tailwind 等），或根据设计稿/截图进行高还原实现；要求输出可直接落地的 production-grade 代码与清晰的设计决策，并强制遵循 BenZenith 的品牌调性（东方极简、珠宝级质感、水/墨肌理、黑金与温润中性色体系），避免通用模板化“AI slop”界面。
---

# BenZenith Frontend Design

## Load references first
- Read `references/brand-tokens.md` before做任何视觉决策。
- 当涉及按钮/卡片/背景肌理/动效实现时，再读 `references/ui-recipes.md`。

## Design intent (fixed for BenZenith)
- 固定审美方向：luxury/refined + Eastern minimal + water/ink texture + sharp gold accents。
- 禁止漂移到其他审美（例如：紫色渐变白底、硅谷 SaaS dashboard、卡通/玩具感、过度圆润和糖果色）。

## Workflow
1) Clarify brief quickly  
- 明确页面类型（官网/电商/活动页）、信息层级、目标动作（CTA）、技术栈（Next.js/React/Tailwind/纯 HTML）。
- 若用户给了设计稿/截图：先提炼 layout + tokens + 组件清单，再编码。

2) Commit to tokens  
- 所有颜色、字体、圆角、阴影、间距、动效必须来自 `brand-tokens.md`（必要时可在 token 范围内做深浅阶）。

3) Build production-grade UI  
- 输出真实可运行代码；组件拆分清晰；移动端优先保证排版与可读性。
- 强制可访问性：对比度、键盘可用、focus states、语义标签。

4) Make it feel “crafted”  
- 细节优先：字距/行高、分割线、hover/press、图片裁切、栅格与留白。
- 动效克制但高级：低频、高质感、带“水感”的 easing。

## Output contract
- 给出：设计决策摘要（不超过 10 条）、关键 tokens（CSS variables 或 Tailwind theme 扩展）、以及完整代码（组件/页面）。
- 避免：长篇泛泛解释、与 BenZenith 无关的视觉风格发散。
