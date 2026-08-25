---
name: high-end-visual-design
description: Design premium agency-level web interfaces with deliberate typography, spacing, surfaces, responsive layouts, micro-interactions, and performant motion. Use when creating polished landing pages, portfolios, product sites, or visually ambitious UI.
---

# High-End Visual Design

Choose one context-fitting vibe and layout; vary future work rather than repeating templates.

## Direction

Vibes:

- Ethereal glass: OLED black, radial mesh glow, geometric grotesk, restrained translucent fixed layers.
- Editorial luxury: cream/sage/espresso, high-contrast variable serif, subtle paper grain.
- Soft structuralism: white/silver, massive grotesk, airy components, diffused ambient shadows.

Layouts:

- Asymmetric bento with meaningful mixed spans.
- Z-axis cascade with controlled overlap/rotation.
- Editorial split with large type and image-led interaction.

Below 768px: reset spans/rotations/overlaps, use one column, `w-full`, `px-4`, `py-8`. Use `min-height: 100dvh`, never `h-screen`.

## System

- Avoid Inter/Roboto/Arial/Open Sans/Helvetica, thick default icon sets, generic gray borders, harsh shadows, edge-glued navs, equal three-column grids, instant or linear motion.
- Use premium fitting fonts, fine-line icons, large section rhythm (`py-24`–`py-40`), intentional texture, and coherent light direction.
- Major surfaces use concentric double-bezel architecture when appropriate: subtle padded outer shell plus distinct inner core with calculated smaller radius and highlight.
- Primary CTA may use nested circular trailing-icon island. Hover shifts icon diagonally; press scales button near `0.98`.
- Floating pill nav may morph hamburger lines into X and reveal full-screen menu with staggered masked links.
- Reveal entries with slow fade/translate/blur. Use `IntersectionObserver` or motion library, never continuous raw scroll listener.

## Performance

- Animate only `transform` and `opacity`; custom spring/cubic-bezier, no `linear` or `ease-in-out`.
- Use `will-change` only during active animation.
- Limit backdrop blur to fixed/sticky surfaces; never large scrolling areas.
- Put grain on fixed `pointer-events-none` pseudo-element.
- Define z-index layers; no arbitrary huge values.

## Build Check

Confirm chosen vibe/layout, readable responsive collapse, generous spacing, nested surface/CTA logic where fitting, custom motion, scroll reveals, GPU-safe properties, restrained blur, and no banned defaults. Premium coherence beats decorative excess.
