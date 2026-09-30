---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief — index.html (Barrabrava)

**Scope:** single-page restaurant site, three hash views (Inicio / Carta / Contacto).
**Mode:** Persuade. **Audience:** locals and visitors in Mar del Plata, on a phone, at night.
**Job:** read the real menu with real prices, then reserve. **Action:** call the local, or open a prefilled WhatsApp reservation.
**Proof:** the actual 20-dish seasonal menu, real hours, real address, real photos. Nothing else is available.
**Constraints:** static HTML/CSS/JS, no build, no backend. Photos are 172×224 px and must not be scaled past their sharpness. Prices stay literal (`$ 10,00`–`$ 21,00`). The only phone is a landline the user chose to keep, so calling is the primary action and WhatsApp is the fallback.

## Direction — canon (category standard, printed seasonal menu)

**THESIS.** The site *is* the menu. One document, one column, set like a well-printed seasonal menu, not a landing page with a hero over a card grid of dishes. It refuses the restaurant-site default.

**OWN-WORLD.** Warm off-white paper `#F9F8F3`; carbon ink `#1A1A1A` / `#2B2B2B`; butter-yellow `#E5C365` as the only fill and never as text; dotted leader rules joining each dish name to its price; Playfair Display SC for display, Karla for text, tabular figures in a right-aligned price column; square corners, hairline rules, and no decorative shadow anywhere except one soft page-edge on the floating call button. A single authored moment: the leaders draw themselves once as the carta enters.

**STORY.** Someone opening the page at 21:40 on a phone sees a real restaurant in the centre of Mar del Plata, reads genuine dishes at genuine prices, and can reach the local in one tap.

**FIRST VIEWPORT.** Masthead: `Barrabrava` in Playfair at 4.75rem (76 px, under the 6rem display ceiling) with `San Lorenzo 1349 · Mar del Plata` beneath in Karla caps. A two-line kitchen note in the product's own voice, no adjectives. Two actions: **Llamar al 0223 596 9469** filled in butter-yellow, **Ver la carta** outlined. The open/closed line as plain text, not a badge. Below, the first four Pescados y Mariscos already showing name, leader and price, so the menu mechanic is visible **above the fold on desktop** — Pescados y Mariscos is the only category with four rows that carry a real photo (Entradas has three), so the promise never has to fall back to a placeholder. On a 390 px phone the cover alone exceeds one screen, and PRODUCT.md names the phone as the primary device at night; the promise is therefore scoped to desktop rather than met by compressing the masthead.

**FORM.** Canon — the user took the standing exit over the rolled assignment. Seed key `a205d69c`, kind `canon`, scope `direction`, mode `persuade`. Bar of craft: a printed seasonal menu of a seasonal restaurant.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Signature moment

The dotted leader between dish name and price draws from the name to the price, once, as the carta view enters. Exponential ease-out, visible by default, neutralized under `prefers-reduced-motion`.

## Unresolved

- Dish descriptions in `data.js` were authored from dish names and are unvalidated by the owner.
- WhatsApp is built from a landline and probably does not receive messages; the call path is the real one until a mobile number exists.
- Prices are unscaled from the source and may be wrong, but the user chose to keep them literal.
