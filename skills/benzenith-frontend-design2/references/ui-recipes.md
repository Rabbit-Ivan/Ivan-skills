# UI Recipes (BenZenith v2)

## CTA hierarchy (critical)
Default primary CTA = Editorial link CTA (NOT a big button)
- Style: text + thin underline (hairline) + optional small arrow
- Underline color: Gold at low opacity
- Hover: underline opacity up, text opacity slightly down
- Active: slight translateY(1px)

When to use solid button:
- 表单提交、支付、强功能动作（非品牌叙事型 CTA）

## Buttons (when required)
Primary solid:
- bg: Ink
- text: Ivory/White
- radius: r-pill
- border: 1px solid rgba(255,255,255,0.12)
- hover: subtle gold glint overlay
- active: translateY(1px)

Secondary outline:
- bg: transparent
- border: hairline
- hover: background wash (6–8% opacity)

## Header / navigation
- 极简：logo 是视觉中心，导航文字轻、低对比。
- Active state: underline persists (Gold low opacity) or small gold dot indicator.
- Avoid: pill tabs, heavy dropdown styling.

## Cards / product tiles
- Card is mostly an image container + minimal text.
- No heavy shadows; prefer hairline border or nothing.
- Hover: underline reveal / subtle image sharpness / micro glint.

## Dividers
- Use hairline dividers and large whitespace.
- Never use thick separators or noisy patterns.

## Forms (newsletter)
- Input: minimal, hairline border, clear focus ring
- Placeholder: Smoke
- Button: can be outline or editorial link depending on layout
