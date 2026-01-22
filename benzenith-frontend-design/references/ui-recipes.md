# BenZenith UI Recipes

## Buttons
Primary CTA (solid):
- Background: Ink
- Text: Ivory/White
- Radius: r-pill
- Border: 1px solid rgba(255,255,255,0.12)
- Hover: subtle gold “glint” (thin gradient overlay, low opacity)
- Active: translateY(1px), reduce glint

Secondary CTA (outline):
- Background: transparent
- Text: Ivory on dark / Ink on light
- Border: hairline
- Hover: background wash (Ink on light at 6–8% opacity, or White on dark at 6–8%)

Editorial link CTA (BenZenith default):
- Render as text + underline
- Underline: thin (1px), offset 6–8px, color = Gold (low opacity)
- Hover: underline opacity up, text slight opacity down

## Cards / surfaces
- Use Sand/Ivory backgrounds with r-md and shadow-1 (light pages).
- On dark pages: Ink-2 surface + hairline border + subtle inner highlight.

## Header / navigation
- Minimal, typography-led.
- Hover state: gold underline or gold dot indicator; avoid pill tabs.
- Active state: underline persists.

## Background grain (implementation hint)
- Use a pseudo-element overlay with a tiny noise texture or CSS noise approximation.
- Keep opacity extremely low (0.04–0.08).

## Imagery
- Prefer large, full-bleed hero images with controlled negative space.
- Crop intentionally; never “center everything by default” if it reduces tension.

## Micro-interactions
- Hover: text underline reveal, icon rotate 8–12deg max, or small blur-to-sharp.
- Scroll: one orchestrated hero reveal is enough; do not animate every block.
