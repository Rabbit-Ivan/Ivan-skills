# PC Layout Specs (1920 baseline)

> 这些是“强约束”。当用户说要复刻 PC 端设计稿时，优先级高于个人审美推断。

## Home sections (PC)
Section 1: Hero Banner
- Section size: 1920 * 800 px
- Text lockup size: 403 * 46 px (centered both axes)
- Copy: “聽從善意 意行隨心”（示例：保持中英/繁简按用户提供版本）

Section 2: Brand Intro
- Section size: 1920 * 350 px
- Title height: 46 px
- Body height: 19 px
- Title-body gap: 49 px
- Text block centered both axes

Section 3: Jewelry Series
- Section size: 1920 * 935 px
- Image size: 400 * 500 px * 3
- Gap between images: 100 px
- Title height: 46 px
- Body height: 19 px

Section 4: Brand Philosophy
- Section size: 1920 * 800 px
- Title height: 46 px (centered)

## Implementation guidance
- Desktop-first：以 1920 画布为 baseline，用 `clamp()` 在 1440–1920 区间平滑缩放，保持比例与留白。
- 关键间距（49px、100px）优先保持“视觉比例一致”；到 1024 以下再做断点重排。
