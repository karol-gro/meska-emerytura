---
name: Męska emerytura
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c4c6cf'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8e9099'
  outline-variant: '#43474e'
  surface-tint: '#adc7f7'
  primary: '#adc7f7'
  on-primary: '#133057'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#455f88'
  secondary: '#bcc7dd'
  on-secondary: '#263142'
  secondary-container: '#3c475a'
  on-secondary-container: '#aab6cc'
  tertiary: '#ffb3b0'
  on-tertiary: '#68000f'
  tertiary-container: '#720011'
  on-tertiary-container: '#ff7170'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#d8e3fa'
  secondary-fixed-dim: '#bcc7dd'
  on-secondary-fixed: '#111c2c'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b0'
  on-tertiary-fixed: '#410006'
  on-tertiary-fixed-variant: '#8c1620'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  data-display:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
spacing:
  base: 8px
  container-max: 768px
  gutter: 24px
  margin-mobile: 16px
  section-gap: 80px
---

## Brand & Style

The design system is engineered to evoke a sense of urgency, gravity, and social responsibility. It addresses the systemic retirement gap in Poland not as a corporate financial tool, but as a public interest manifesto. The aesthetic sits at the intersection of **Modern Brutalism** and **High-Contrast Minimalism**, utilizing raw structural elements to convey honesty and "unfiltered" data.

The target audience includes working professionals, policymakers, and social activists. The emotional response should be one of sober realization followed by a call to civic or personal action. By stripping away decorative fluff and focusing on stark typography and a deep, immersive dark mode, the design system centers the user's attention entirely on the weight of the data.

**Key Stylistic Pillars:**

- **Raw Authority:** Use of heavy strokes and sharp corners to suggest stability and truth.
- **Data Immersion:** High-contrast text against deep backgrounds to ensure the "Retirement Gap" figures are inescapable.
- **Purposeful Friction:** Large, bold interactive elements that require conscious engagement.

## Colors

The palette is rooted in a "Midnight" spectrum to emphasize the serious nature of the retirement crisis.

- **Primary (Deep Cobalt):** Used for primary structural elements and the "Male" demographic data point. It represents the establishment and the current state of the pension system.
- **Secondary (Slate Gray):** Used for supporting text, borders, and inactive states. It provides a neutral bridge between the deep background and the white content.
- **Accent (Crimson Warning):** A striking red used exclusively for the "Gap" itself, warnings, and high-priority calls to action. It is the visual manifestation of the inequality.
- **Background (Neutral Dark):** A near-black navy that provides more depth than pure black, reducing eye strain while maintaining maximum contrast for data visualization.

## Typography

Typography is the primary vehicle for the design system's narrative. We use **Montserrat** for headlines to provide a bold, geometric, and authoritative voice. Its heavy weights are used for key statistics and "The Gap" figures to ensure they feel "heavy" and significant.

**Inter** is utilized for all body copy and data labels to maintain clinical readability. For numerical data, Inter's tabular lining features should be enabled to ensure that columns of currency and percentages align perfectly for comparison.

**Scale and Impact:**

- Use `display-lg` for the primary hero numbers (the total gap amount).
- Use `label-bold` with uppercase styling for section headers to create a "report" or "dossier" feel.
- Line heights are kept tight on headlines for impact and generous on body text for readability in dark mode.

## Layout & Spacing

The layout follows a **Single Narrow Column** philosophy: the app is one focused calculator flow, so all content lives in a centered container with a 768px max width. The constrained line length keeps the copy readable and enforces a strict top-to-bottom narrative — your data, assumptions, verdict.

- **Grid:** One column, 768px max width on desktop. Within the column, paired content (the two input fields, the "Male" comparison cards, derived stats) splits into 2–3 sub-columns; everything else spans the full container width.
- **Rhythm:** An 8px base unit drives all spacing. Generous `section-gap` spacing is intentional; it forces the user to digest one piece of information or one calculation step at a time, preventing data-overwhelmed fatigue.
- **Mobile:** On mobile devices, margins shrink to 16px, and the sub-columns collapse into a single-column stack. Typography scales down slightly, but the "Data Display" numbers remain large to maintain impact.

## Elevation & Depth

This design system rejects traditional shadows in favor of **Tonal Layering** and **Bold Outlines**. This reinforces the "serious/educational" feel over a "consumer/app" feel.

- **Surface Tiers:** The base background is the darkest shade. Input areas and "Cards" use a slightly lighter slate shade to create a subtle lift without needing a shadow.
- **High-Contrast Outlines:** Instead of shadows, interactive elements or focused sections use 1px or 2px solid borders in Primary Cobalt or White.
- **Zero Transparency:** Avoid glassmorphism. Surfaces should be opaque and solid to represent the "hard facts" of the data being presented.

## Shapes

The design system utilizes **Sharp (0px)** corners for all primary UI elements.

- **Rationale:** Hard edges convey a sense of institutional rigor, seriousness, and lack of "sugar-coating."
- **Application:** Buttons, input fields, progress bars, and data cards must all have 90-degree angles.
- **Exception:** Small icons or circular data points (e.g., radio button inner circles) may retain their circular nature for functional clarity, but all containers must be rectangular.

## Components

- **Buttons:** Primary buttons are solid White with Black text, creating maximum contrast against the dark background. They use `label-bold` typography. Hover states invert the colors or move to the Primary Cobalt.
- **Input Fields:** Large, rectangular fields with 2px Slate Gray borders. Upon focus, the border turns White. Placeholders are low-opacity Slate Gray.
- **Comparison Cards:** Two side-by-side containers used for "Male" vs "Female" calculations. The "Male" card uses a Primary Cobalt top-border; the "Female" card (or the resulting Gap card) uses the Crimson Accent.
- **The "Gap" Indicator:** A specialized component that shows a growing bar chart or a "hole" in a visualization. It should use the Crimson Accent color to highlight the deficit.
- **Data Tables:** Clean, minimalist rows separated by thin Slate Gray lines. No zebra-striping; use hover-highlighting for row focus.
- **Checkboxes/Radios:** Square-format (Brutalist style). When checked, they fill solid with the Primary Cobalt or White.
