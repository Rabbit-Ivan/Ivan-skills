# BenZenith Design Tokens

## Color system (use CSS variables)
Primary neutrals (BenZenith signature):
- Ink (primary bg/text on light): #0B0B08
- Ink-2 (surfaces on dark): #1E1E16
- Smoke (secondary dark): #54514C
- Sand (warm light background): #DFDFD7
- Ivory (primary light): #F8F8F7
- White (pure): #FFFFFF

Accents (use sparingly, as sharp highlights):
- Gold (primary accent): #B0A470
- Gold-deep: #A79459
- Jade (secondary accent): #85BA67
- Cinnabar (secondary accent): #B11A14

Rules:
- Default pages: Ink + Sand/Ivory + Gold accents
- Jade/Cinnabar: only for small highlights (badges, micro-accents, hover glints), never large gradients.

## Typography (match brand book)
Detected/adjacent brand fonts:
- EN Serif: "Book Antiqua" (fallback: "Palatino Linotype", Palatino, serif)
- EN Sans (light): "Helvetica Now Display Light" (fallback: "Helvetica Neue", Helvetica, Arial, sans-serif)
- ZH Serif: "Kozuka Mincho" family (fallback: "Songti SC", "Noto Serif SC", serif)
- ZH Sans Light: "Source Han Sans SC Light" (fallback: "Noto Sans SC", "PingFang SC", sans-serif)

Usage:
- Headlines: ZH Serif + EN Serif (high contrast, slightly tighter tracking)
- Body: ZH Sans Light + EN Sans Light (comfortable line-height)

Recommended scale (desktop):
- H1: 46–56px, lh 1.08–1.15
- H2: 34–40px, lh 1.15
- H3: 22–26px, lh 1.2
- Body: 16–19px, lh 1.65–1.85
- Micro: 12–13px, lh 1.6

## Radius (luxury = restrained)
- r-xs: 6
- r-sm: 10
- r-md: 14
- r-lg: 20
- r-pill: 9999
Rules:
- Large layout containers: r-md or r-lg
- Buttons: r-pill (primary), or r-sm (editorial variant)

## Shadows (avoid heavy elevation)
Shadow tokens (RGBA based on Ink):
- shadow-1: 0 8px 24px rgba(11, 11, 8, 0.14)
- shadow-2: 0 18px 50px rgba(11, 11, 8, 0.18)

Rules:
- On dark backgrounds: prefer 1px borders + subtle inner highlights instead of big shadows.

## Borders / dividers
- Hairline: 1px solid rgba(255,255,255,0.10) on dark
- Hairline: 1px solid rgba(11,11,8,0.10) on light
- Use generous spacing; dividers should feel “quiet”.

## Motion (water-like, not bouncy)
Durations:
- fast: 140ms
- base: 240ms
- slow: 420ms

Easing:
- ease-water: cubic-bezier(0.22, 0.8, 0.2, 1)

Rules:
- Prefer fade/blur + small translate (6–12px)
- No springy/bouncy motion; no excessive stagger everywhere (only in hero reveals)

## Background craft
- Always add subtle atmosphere: radial gradients + faint grain/noise overlay.
- Keep textures low-contrast; never overpower product imagery.
