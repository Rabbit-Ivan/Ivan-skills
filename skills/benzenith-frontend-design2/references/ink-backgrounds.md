# Ink Backgrounds (Implementation Recipes)

## Core principle
- 水墨是“构图结构”，不抢主体。
- 低对比、低透明度、可被裁切、允许留白。

## Layer recipe (recommended)
1) Base background (Ink or Sand/Ivory)
2) Radial gradients (very subtle) for atmosphere
3) Ink texture image/SVG (multiply / screen depending on base)
4) Grain/noise overlay (opacity 0.04–0.08)

## CSS implementation hints
- Use pseudo-elements `::before` / `::after` for overlays.
- Keep pointer-events disabled for overlays.

```css
/* English comments only */
.section {
  position: relative;
  overflow: hidden;
}
.section::before {
  content: "";
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle at 30% 20%, rgba(176,164,112,0.10), transparent 55%),
              radial-gradient(circle at 70% 80%, rgba(255,255,255,0.06), transparent 60%);
  pointer-events: none;
}
.section::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.06;
  pointer-events: none;
  /* Replace with a real noise texture if available */
  background-image: url("/textures/noise.png");
  mix-blend-mode: overlay;
}
