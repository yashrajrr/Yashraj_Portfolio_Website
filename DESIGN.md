# Design System Documentation: Electric Brutalism

## 1. Overview & Creative North Star
**Creative North Star: The Electric Brutalist**

This design system is a rejection of the soft, rounded "friendly" web. It finds its soul in the intersection of high-fashion editorial layouts and raw architectural brutalism. By combining a near-black charcoal foundation with the high-frequency vibration of Electric Indigo and strategic hits of Crimson, we create an environment that feels authoritative, sophisticated, and intentionally aggressive.

We break the "template" look by leaning into heavy typography, absolute sharp edges (0px radius), and high-contrast tonal shifts. This system does not rely on lines to define space; it relies on mass, light, and the tension between deep shadows and vibrant glows.

---

## 2. Colors & Surface Logic

The palette is built on a "Burnt Charcoal" base, utilizing a sophisticated hierarchy of dark tones to create depth without visual clutter.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined through background color shifts. Use `surface-container-low` (#1C1B1B) against a `surface` (#131313) background to define a zone. The eye should perceive the change in "mass" rather than a structural outline.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **Base:** `surface` (#131313)
*   **Sunken Elements:** `surface-container-lowest` (#0E0E0E) for deep, recessed areas like code blocks or footer wells.
*   **Raised Elements:** `surface-container-high` (#2A2A2A) or `highest` (#353534) for floating panels or active states.

### The "Glass & Gradient" Rule
To prevent the dark theme from feeling "flat" or "dead," use semi-transparent surface colors with a `backdrop-blur` (20px+) for floating navigation or overlays. Main CTAs should utilize a subtle linear gradient from `primary` (#C0C1FF) to `primary_container` (#8083FF) to provide a "lit from within" professional polish.

---

## 3. Typography: Editorial Authority

The typography scale uses **Public Sans** for high-impact, heavy-weight displays and **Inter** for precision utility.

*   **Display & Headlines (Public Sans):** Use heavy weights (700-900). Use tight letter-spacing (-0.02em) for `display-lg` to create a dense, "blocky" editorial feel. This is the "voice" of the brand—loud, sharp, and uncompromising.
*   **Body & Labels (Inter):** Focus on readability. Use `body-md` (0.875rem) for primary content. Inter’s neutral, technical character balances the aggression of Public Sans.
*   **Intentional Asymmetry:** Align large headlines to the far left or right, leaving significant "dead space" (using the 24-unit spacing scale) to create a premium, gallery-like layout.

---

## 4. Elevation & Depth

In a world of sharp edges, depth is the only way to convey "touchability."

### The Layering Principle
Depth is achieved by "stacking" the surface-container tiers. Place a `surface-container-highest` card on top of a `surface-container-low` section. The 0px radius ensures these look like stacked stone or metal sheets.

### Ambient Shadows
When a "floating" effect is required, shadows must be extra-diffused. 
*   **Blur:** 40px – 80px.
*   **Opacity:** 8% - 12%.
*   **Tint:** Use a dark indigo tint for the shadow color rather than pure black to simulate the "glow" of the Electric Indigo interacting with the charcoal surface.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input focus), use the `outline_variant` (#464554) at 20% opacity. **Never use 100% opaque borders.**

---

## 5. Components

### Buttons
*   **Primary:** Sharp 0px edges. Background: `primary` (#C0C1FF). Text: `on_primary` (#1000A9). On hover, add a subtle `primary_container` outer glow.
*   **Secondary:** Ghost style. Transparent background with a `ghost border` (20% `outline`). Text: `on_surface`.
*   **Tertiary (Crimson):** Reserved for high-stakes actions (Delete, Emergency). Use `tertiary_container` (#FF544A) with `on_tertiary_container` (#5C0004).

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Strategy:** Separate list items by alternating `surface` and `surface-container-low` backgrounds, or use a 1.4rem (`spacing-4`) vertical gap. 
*   **Edges:** Always `0px`. The "stack" of cards should look like a solid architectural column.

### Input Fields
*   **Base State:** `surface-container-highest` background. No border.
*   **Focus State:** A 2px bottom-bar of `primary` (Electric Indigo). 
*   **Error State:** Text changes to `tertiary` (Crimson) with a subtle `error_container` background shift.

### Tooltips
*   Use `inverse_surface` (#E5E2E1) for the background to create an immediate, high-contrast pop against the charcoal UI. Typography should be `label-sm`.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use extreme whitespace (e.g., `spacing-20` or `24`) between major sections to let the heavy typography breathe.
*   **Do** use Electric Indigo sparingly as a "laser" to guide the eye—not as a background wash.
*   **Do** ensure all container edges are 0px. Even a 2px radius breaks the Brutalist aesthetic.

### Don't:
*   **Don't** use generic grey shadows. If an element "glows," its shadow should carry a hint of that color.
*   **Don't** use 1px dividers to separate content. Use the spacing scale and background shifts.
*   **Don't** use soft/light weights for Public Sans headlines. If it’s a headline, it must be heavy.

---

## 7. Signature Textures (The "Gritty" Polish)
To achieve the "slightly gritty" look requested, apply a subtle noise overlay (3-5% opacity) to the `surface` and `surface-container` tiers. This breaks the digital perfection of the charcoal grays and gives the interface a tactile, "printed" quality.