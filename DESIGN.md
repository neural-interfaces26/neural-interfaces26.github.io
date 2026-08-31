# EEG/EMG Foundation Challenge design contract

This file is the machine-readable visual authority for every page and component. Read it before changing UI. It records the approved PSD identity and translates reference grammar without importing reference artwork, copy, or product identity.

## North star

A scientific signal trophy on clean paper: one violet event, rigorous ink typography, and enough silence to feel institutional.

## Source hierarchy

Resolve conflicts in this order:

1. `Linkedin Post 1.psd` controls visual identity, source artwork, palette, type, and material.
2. [`docs/CONTENT_INVENTORY.md`](docs/CONTENT_INVENTORY.md) controls competition facts.
3. Existing routes and HTML content control URLs, anchors, detailed rules, equations, biographies, and dataset descriptions.
4. The references below control composition grammar and finish only.

Reference grammar, in binding audit order:

- Mono-color composition: [original post](https://x.com/yanliudreamer/status/2093968800316293400?s=20), [source skill](https://github.com/yanliudesign/mono-color-skill), [design-system board](https://raw.githubusercontent.com/yanliudesign/mono-color-skill/main/examples/mono-color-design-system-board.png), [reference sheet 01–06](https://pbs.twimg.com/media/HQ9FGqTbcAAAMyZ.jpg?name=orig), [reference sheet 07–12](https://pbs.twimg.com/media/HQ9FGqRbAAANhXk.jpg?name=orig), [system rules](https://pbs.twimg.com/media/HQ9FGqUa8AAII6g.jpg?name=orig), and [composition grammar](https://pbs.twimg.com/media/HQ9FGqRbQAAAX-U.jpg?name=orig).
- Agent-readable contracts: [DESIGN.md post](https://x.com/Voxyz_ai/status/2093766772029559077?s=20), [Refero library](https://styles.refero.design/), [Refero Linear example](https://styles.refero.design/style/90ce5883-bb24-4466-93f7-801cd617b0d1), and [Refero Notion example](https://styles.refero.design/style/2bf4c61f-de10-4614-ba1b-20c0453bd2a9).
- Scientific campaign finish: [Virtual Cell Challenge](https://virtualcellchallenge.org/), [benchmark hero texture](https://virtualcellchallenge.org/homepage/hero-bgnd.png), and [benchmark prize illustration](https://virtualcellchallenge.org/homepage/prizes-bg.png).

Refero governs how these rules are recorded, not the site's appearance. Virtual Cell Challenge sets the standard for hierarchy, whitespace, material detail, imagery, sponsor treatment, and pacing, not the composition. The PSD wins every conflict.

## Colors and plate roles

| Role | Exact value | Use |
|---|---|---|
| Paper | `#FFFFFF` | Primary page ground and visible negative space |
| Lavender ground | `#F7F5FC` | Banded surface and quiet release fields |
| Ink | `#07101F` | Body copy, headings, rules, metadata |
| Muted slate | `#5A6378` | Secondary copy |
| Faint slate | `#666B84` | Tertiary labels with verified AA contrast |
| Lavender line | `#E3DBF4` | Dividers and card borders |
| Identity violet | `#5332F4` | The single chromatic UI plate: emphasis and image energy |
| Deep violet | `#3F1BC7` | Hover and pressed state |
| Mid violet | `#AE99E5` | Source-aligned quiet violet detail |
| Violet wash | `rgba(83, 50, 244, 0.08)` | Ambient tint only |
| Code ink | `#0B1020` | Code surfaces only |

The interface is a two-plate system: violet carries emphasis and image energy; ink carries copy, rules, and metadata. Do not introduce a third UI accent. Primary glass is white at `92%` opacity; secondary glass is white at `58%` opacity. Primary glass borders are white at `72%`, their inset highlight is white at `86%`, violet shadows use `28%` resting and `38%` lifted opacity, and the focus halo uses violet at `28%` opacity.

The PSD trophy may retain its native lilac and stone tones. Scientific figures, portraits, and sponsor marks may retain source colors. These are source-art exceptions, not a palette expansion and not permission to sample new UI accents from them.

## Typography

- Display and body: `"Noto Sans", system-ui, -apple-system, "Segoe UI", sans-serif`; weights 300, 400, 500, 600, 700, 800, 900.
- Code, tabular figures, dates, and compact technical metadata: `"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace`; weights 400, 500, 600.
- Shared editorial scale: homepage hero `42–64 px`; secondary-page title `40–56 px`; section heading `32–48 px`; body `16 px`; lead `18–20 px`; microcopy `10–12 px`.
- Maintain one clear `5×–12×` display/microcopy relationship where space permits. Do not scale factual copy down to create it.
- Display tracking is `-0.025em` for hero and page titles and `-0.02em` for section headings; their line heights are `1.02`, `1.08`, and `1.1` respectively. Body line height is `1.5` and reading text stays within `65ch`.
- Large primary headings may end in one violet full stop. Use the motif deliberately, never on every heading.
- Factual text stays fully readable: never distort it, screen it, or hide it behind an overlap.

| Role | Fluid scale | Weight | Leading |
| --- | --- | --- | --- |
| Body | 16px | 400–600 | 1.5 |
| Action and navigation | 16px | 600–700 | 1.5 |
| Lead | 18–20px | 400 | 1.6 |
| Homepage hero | 42–64px | 800 | 1.02 |
| Secondary hero | 40–56px | 700 | 1.08 |
| Section heading | 32–48px | 700 | 1.1 |

Weight 900 is reserved for intentional numeric display figures, never semantic H1/H2 headings.

## Spacing and layout

- Base unit: `4 px`. Use multiples of 4 for spacing and sizing unless a 1 px rule or optical adjustment is required.
- Content max width: `1440 px`; reading width: `65ch`; desktop, tablet, and mobile gutters: `48 px`, `32 px`, and `20 px`.
- Breakpoints: `1200 px`, `900 px`, and `640 px`. Navigation collapses below `900 px`; tracks are 2×2 above `900 px` and one column below `640 px`.
- Campaign sections keep `25%–55%` visibly open paper. Each has exactly one focal event and one visibly quieter release zone.
- Use one dominant object and one decisive type/object collision. Let paper cut through or frame the object; do not distribute equal visual weight across a template.
- Desktop hero is at least `680 px` and at most `calc(100dvh - 72px)`. Never use `height: 100vh`. Mobile places copy before a `4:3` trophy crop.
- Sponsor layouts reflow from six columns to three to two. Tables scroll inside labelled regions; the page itself must not overflow at `320 px` or `200%` zoom.
- At most one manual gesture family may recur: signal or registration rules derived from the PSD.

## Components

- **Header:** one shared top header, maximum `72 px` tall. Brand, links, and Register remain on one desktop line. Below `900 px`, use a keyboard-operable menu with `aria-expanded`, Escape close, and focus return.
- **Buttons:** minimum `44×44 px` target, violet primary or paper ghost only. Hover changes color and moves no more than 2 px; active state uses `scale(.98)`. Every button has a visible focus halo.
- **Glass panels:** use the exact primary or secondary white opacity above, near-invisible white border, violet-tinted shadow, and blur. Glass must remain legible without backdrop-filter support.
- **Track modules:** preserve the PSD's numbered 2×2 order and exact labels `CROSS-STIMULUS`, `CROSS-SESSION`, `CROSS-DEVICE`, `CROSS-USER`; numerals and track content form one ruled system, not four generic cards.
- **Timeline:** one legible chronological sequence with dates in IBM Plex Mono, ink rules, and one violet active signal. Do not fragment it into unrelated cards.
- **Sponsor stage:** group real logos by function, preserve source marks, give each group deliberate open paper, and avoid a compressed footer wall.
- **Data tables:** dense but readable, tabular numerals, clear row/column headers, ink rules, restrained violet emphasis, and horizontal scrolling inside an accessible labelled region.
- **Code blocks:** IBM Plex Mono on `#0B1020`, preserve copy feedback and horizontal scrolling, and never use code as campaign decoration.
- **Footer:** one shared compact institutional footer with essential routes and registration destination; no generic multi-column link farm.

## Motion and texture

- Texture is a subtle halftone or grain reproduction cue only. It never affects text, controls, diagrams, logos, or contrast, and never simulates age.
- Major blocks may use one `opacity` plus `translateY(18px)` reveal over `500ms`. The trophy may settle once on first paint. Hover movement is 1–2 px; active buttons use `scale(.98)`.
- Existing counter and copy feedback may remain. Do not add an animation library, scroll hijacking, custom cursor, parallax stack, or continuously running decoration.
- Under `prefers-reduced-motion: reduce`, scrolling is immediate, animation and transition duration is effectively zero, and reveal content is visible without transformation.

## Do / Don't

### Do

- Treat the trophy and hero headline as one focal event, with a quiet release zone.
- Keep paper active, violet controlled, rules precise, hierarchy obvious, and technical content readable.
- Use reference material as evidence for plate discipline, negative space, type/object tension, contract clarity, and finish.
- Preserve every fact, route, anchor, equation, biography, dataset description, and registration destination.

### Don't

- Do not use fake aging, sepia, beige lifestyle minimalism, ornamental or decorative grunge, torn-paper collage, stickers, blobs, centered poster templates, arbitrary accent colors, or copied reference arrangements.
- Do not import full-color photography as campaign decoration, gradients, rainbow or neon accents, a monochrome color wash, glossy mockups, 3D depth, cinematic lighting, lens blur, hard shadows, clean vector-flat poster styling, scrapbook overlap, distressed borders, nostalgic props, or retro type merely because the system uses halftone.
- Do not import Refero catalogue UI, Linear's dark palette, Notion's product identity, or Virtual Cell Challenge's botanical imagery, serif voice, cream palette, page copy, or exact section layouts.
- Do not replace, redraw, or generate an approximation of the trophy.

Reference originality firewall: a reference is evidence for grammar, never a layout to trace. Change at least four structural features from every supplied reference: subject/crop, layout family, headline wording, headline location, image shape/count, grid, type pairing, metadata treatment, ratio, or disruption device. Never reproduce exact object arrangement, line breaks, labels, dates, logos, border system, distinctive slogan, signature, or publication mark. Never present transformed branded source material as an official artifact.

## Page recipes

- **Homepage — `editorial cover`:** the PSD trophy and approved hero headline are one dominant composition; title locks to the object, paper stays open, and issue-like metadata remains sparse.
- **Technical pages — `editorial journal`:** one strong title/date, calm reading width, disciplined columns, and code/table content as the primary evidence. Do not force poster theatrics into long-form material.
- **Track grid — `ruled information poster`:** the four numbered tracks form one ordered field with thin ink rules and one violet signal event.
- **Awards — `type-led declaration`:** prize amounts control the hierarchy; smaller evidence and rules ground the statement without competing with it.

## QA rubric

- **Reference fidelity:** reaches the reference bar for hierarchy, active whitespace, material restraint, sponsor hierarchy, and section pacing without importing reference identity.
- **Identity fidelity:** exact PSD colors and type families; approved trophy assets; violet/ink plate roles; one focal event; one release zone; no third UI accent.
- **Responsive behavior:** works at `320 px`, all three breakpoints, desktop, `200%` zoom, and mobile Safari without page overflow; navigation and tables reflow as specified.
- **Accessibility:** WCAG 2.2 AA contrast; sequential headings; single `<main id="main">`; functional skip link; visible focus; keyboard menu; meaningful alt text; `44×44 px` targets; reduced motion.
- **Performance:** no framework or runtime dependency; ≤700 KB desktop trophy, ≤500 KB mobile trophy, ≤700 KB OG card, ≤1.8 MB initial homepage transfer; zero console errors and broken same-site links.
- **Originality:** at least four structural choices differ from every supplied poster; no traced arrangement, line break, label system, distinctive lettering, palette, botanical imagery, or copy.

## Round Two detail grammar

- The trophy is the homepage's dominant object. Secondary pages use factual proof and the violet registration rule, never miniature trophy decoration or new route artwork.
- Every secondary hero has one left copy column and one right factual proof rail on desktop; the proof stacks after the CTA on mobile.
- Every secondary route has one compact competition-state rail. Ethics merges provider approval state into this rail instead of adding a second strip.
- Proof/state/meta rows use open paper, a 1px separator, uppercase 10–12px labels, and one short violet registration rule. Rounded glass is reserved for code, technical scrollers, rules caveats, sponsor marks, and primary actions.
- Factual proof values use 700 16px IBM Plex Mono; compact challenge-state values use 700 12px IBM Plex Mono. Neither value class inherits the sans stack or shrinks at mobile breakpoints.
- Visible non-code text has a 10px computed-size floor. Density comes from spacing, measure, and alignment, never unreadably small type.
- Secondary first-fold order is header → hero → competition state → existing local navigation → substantive content.
