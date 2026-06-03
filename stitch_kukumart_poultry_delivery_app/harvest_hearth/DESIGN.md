---
name: Harvest & Hearth
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#42493e'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#586059'
  on-secondary: '#ffffff'
  secondary-container: '#dde5db'
  on-secondary-container: '#5e665f'
  tertiary: '#52320b'
  on-tertiary: '#ffffff'
  tertiary-container: '#6d4820'
  on-tertiary-container: '#ecb987'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcf0ae'
  primary-fixed-dim: '#a1d494'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#23501e'
  secondary-fixed: '#dde5db'
  secondary-fixed-dim: '#c1c9bf'
  on-secondary-fixed: '#161d17'
  on-secondary-fixed-variant: '#414942'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#f0bd8b'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#623f18'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display-lg:
    fontFamily: Nunito Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Nunito Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Nunito Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Nunito Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gap-xs: 0.5rem
  gap-md: 1.5rem
  gap-lg: 2.5rem
  container-padding-mobile: 1.5rem
  container-padding-desktop: 4rem
  max-width: 1280px
---

## Brand & Style
The design system embodies a "Warm Organic" aesthetic reimagined through a modern, minimalist lens. It targets a health-conscious, community-oriented audience that values transparency and quality. The UI should evoke a sense of calm, freshness, and hospitality—moving away from rustic clutter toward a "Smooth Organic" feel.

The style is defined by **Soft Minimalism**. We prioritize breathable white space, high-quality botanical imagery, and a tactile sense of softness. By replacing heavy borders with subtle tonal shifts and generous padding, the interface feels airy yet grounded, much like a well-lit, modern farm kitchen.

## Colors
The palette is rooted in nature. The primary green is deep and professional, ensuring accessibility. The secondary color is a soft sage used for subtle backgrounds and "fill" states.

The neutral palette is shifted away from pure greys toward warm, creamy whites (`#FDFCF8`) to maintain a cozy atmosphere. The `surface-container` backgrounds are intentionally desaturated and lightened to ensure the content feels integrated rather than boxed in. Success, warning, and error states should utilize desaturated versions of green, amber, and terracotta to remain consistent with the organic theme.

## Typography
This design system uses **Nunito Sans** exclusively to leverage its rounded terminals, which reinforce the "Smooth Organic" narrative. 

Readability is the priority. We use a larger-than-standard base font size (18px for primary body text) and a generous 1.6 line-height to ensure the text feels unhurried and easy to consume. Headlines use a tighter letter-spacing and heavier weights to provide a clear visual anchor against the lighter body copy.

## Layout & Spacing
The layout follows a **Fluid Grid** model with an emphasis on "negative space as a feature." 

- **Desktop:** A 12-column grid with 32px gutters. Large 64px (4rem) side margins create a centered, editorial feel.
- **Mobile:** A 4-column grid with 16px gutters and 24px side margins.
- **Vertical Rhythm:** Elements are spaced using a 4px baseline, but we prefer larger increments (24px, 40px, 64px) between sections to prevent the UI from feeling cramped. Elements within cards should have a minimum of 24px internal padding.

## Elevation & Depth
Depth is created through **Tonal Layering** and ultra-soft shadows. We move away from high-contrast borders and instead use subtle background fills (`secondary_color_hex` at various opacities) to define areas.

Shadows are "ambient" style:
- **Low Elevation:** A barely-perceivable shadow (4px blur, 2% opacity) combined with a 1px stroke that is only slightly darker than the surface it sits on.
- **High Elevation (Modals/Popovers):** A wide, soft diffusion (24px blur, 6% opacity) with a slight vertical offset to simulate a gentle lift off the page.

## Shapes
The shape language is defined by a consistent **12px (0.75rem)** radius for standard components like input fields and buttons. Larger containers, such as cards and featured sections, utilize **16px (1rem)** or **24px (1.5rem)** radii to emphasize the friendly, approachable nature of the brand. All corners should feel "soft to the touch."

## Components
- **Buttons:** Primary buttons use a solid fill with white text. Secondary buttons use a tonal fill (secondary color) with primary-colored text. All buttons have high horizontal padding (24px+) to feel substantial.
- **Cards:** No heavy borders. Use a soft fill (1-step darker than the background) or a very low-contrast ambient shadow. Internal padding must be generous (min 24px).
- **Inputs:** Soft background fills (e.g., `#F4F2ED`) instead of white backgrounds with dark borders. The focus state uses a soft 2px glow in the primary color.
- **Chips:** Fully pill-shaped (rounded-full) with tonal backgrounds to denote categories like "Organic," "Local," or "Seasonal."
- **Checkboxes/Radios:** Use a 4px border radius for checkboxes to match the overall smooth theme, avoiding sharp corners.
- **Lists:** Separate list items with generous vertical spacing and a very faint horizontal rule (opacity 5-10%) rather than a solid line.