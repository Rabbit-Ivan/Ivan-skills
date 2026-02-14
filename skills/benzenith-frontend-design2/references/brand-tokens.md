# BenZenith Design Tokens (v2)

> 目标：让输出稳定“像你们官网设计稿”，而不是“像某个通用高级模板”。

## 1) Color system (semantic first)
Neutrals:
- Ink (primary): #0B0B08
- Ink-2 (surface on dark): #1E1E16
- Smoke (secondary text): #54514C
- Sand (warm light bg): #DFDFD7
- Ivory (primary light): #F8F8F7
- White: #FFFFFF

Accents (sparingly):
- Gold: #B0A470
- Gold-deep: #A79459
- Jade: #85BA67
- Cinnabar: #B11A14

Rules:
- 默认：Ink / Sand / Ivory 为主；Gold 只做“锋利点睛”（下划线、分隔、hover glint、徽标小细节）。
- Jade / Cinnabar 仅做微弱强调（badge、极小装饰），禁止大面积铺底或渐变主色。

## 2) Typography (editorial + bilingual)
中文字体（必须明确）：
- Headline Serif (ZH): "Source Han Serif SC" / "Noto Serif SC" / "Songti SC" (fallback)
- Body Sans (ZH): "Source Han Sans SC" / "Noto Sans SC" / "PingFang SC" (fallback)

英文字体（克制、偏古典书卷气）：
- EN Serif: "Book Antiqua" / "Palatino Linotype" / Palatino (fallback)
- EN Sans Light: "Helvetica Neue" / Helvetica / Arial (fallback)

Type usage:
- H1/H2/H3：ZH Serif + EN Serif（偏 editorial）
- Body：ZH Sans + EN Sans（轻字重 + 高可读行高）

Recommended desktop scale (match your PC spec baseline):
- Title height baseline: 46px（用于 section 标题、主标题）
- Body height baseline: 19px（用于 section 正文）
- Default body line-height: 1.75（长文可到 1.85）
- Tracking：标题可略紧（-0.01em 到 -0.02em）；正文保持自然

## 3) Layout primitives
Grid:
- Canvas baseline: 1920px (desktop)
- Content max width (建议): 1200–1280px
- Side padding: 80px (>=1440), 48px (>=1024), 24px (mobile)

Spacing:
- Section vertical padding: 80–140px（根据模板固定）
- Key gap from spec: 49px（标题与正文之间的固定间距）
- Product grid gap (desktop): 60–100px（按模板）

## 4) Radius (luxury restrained)
- r-sm: 10px
- r-md: 14px
- r-lg: 20px
- r-pill: 9999px

Rules:
- 大容器：r-md 或 r-lg
- CTA：默认不用大胶囊按钮；若必须按钮，才用 r-pill

## 5) Shadows & borders (quiet)
Shadows:
- shadow-1: 0 8px 24px rgba(11,11,8,0.14)
- shadow-2: 0 18px 50px rgba(11,11,8,0.18)

Borders (hairline):
- On light: 1px solid rgba(11,11,8,0.10)
- On dark: 1px solid rgba(255,255,255,0.10)

Rules:
- 不用重投影堆叠“卡片感”；优先 hairline + 留白 + 排版张力。

## 6) Motion (water-like, not bouncy)
Durations:
- fast: 140ms
- base: 240ms
- slow: 420ms

Easing:
- ease-water: cubic-bezier(0.22, 0.8, 0.2, 1)

Motion rules:
- 优先：fade + slight translate(6–12px) + subtle blur-to-sharp
- 禁止：弹簧、Q 弹、过度 stagger、全页滚动动画轰炸

## 7) Material / atmosphere
- 必须存在低对比 atmosphere（radial gradient + faint grain/noise）。
- 水墨是“构图结构”，不是装饰贴纸；透明度必须克制（0.06–0.18 级别区间视背景而定）。
