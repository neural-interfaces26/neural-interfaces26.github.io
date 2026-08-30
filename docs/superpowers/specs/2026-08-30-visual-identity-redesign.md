# EEG/EMG Challenge Visual Identity Redesign

**Date:** 2026-08-30  
**Status:** Approved direction; implementation not started  
**Primary source:** `Linkedin Post 1.psd`  
**Quality reference:** https://virtualcellchallenge.org/

## Reference audit

### 1. Yan Liu mono-color editorial system

- Original X post: https://x.com/yanliudreamer/status/2093968800316293400?s=20
- Source skill: https://github.com/yanliudesign/mono-color-skill
- Skill rules: https://github.com/yanliudesign/mono-color-skill/blob/main/SKILL.md
- Design-system board: https://raw.githubusercontent.com/yanliudesign/mono-color-skill/main/examples/mono-color-design-system-board.png
- Original reference sheets: [01–06](https://pbs.twimg.com/media/HQ9FGqTbcAAAMyZ.jpg?name=orig), [07–12](https://pbs.twimg.com/media/HQ9FGqRbAAANhXk.jpg?name=orig), [system rules](https://pbs.twimg.com/media/HQ9FGqUa8AAII6g.jpg?name=orig), [composition grammar](https://pbs.twimg.com/media/HQ9FGqRbQAAAX-U.jpg?name=orig)

The reference is a reusable grammar, not a poster to trace. Adopt one dominant object, active paper, one decisive type/object collision, a restrained two-plate model, a 5×–12× type jump, one focal event, one quiet release zone, and at most one manual gesture family. For this site, the approved plates are identity violet `#5332F4` and ink `#07101F`; the clean paper is white or lavender `#F7F5FC`. The trophy keeps its native lilac and stone tonal range because it is the source identity, not generic decoration.

Do not adopt fake aging, beige lifestyle minimalism, ornamental grunge, torn-paper collage, arbitrary accent colors, centered poster templates, or copied reference composition. Print texture is a controlled reproduction cue, not a retro costume.

### 2. Refero DESIGN.md system

- Original X post: https://x.com/Voxyz_ai/status/2093766772029559077?s=20
- Library: https://styles.refero.design/
- Linear example: https://styles.refero.design/style/90ce5883-bb24-4466-93f7-801cd617b0d1
- Notion example: https://styles.refero.design/style/2bf4c61f-de10-4614-ba1b-20c0453bd2a9
- Original walkthrough video: https://video.twimg.com/amplify_video/2093766713707786240/vid/avc1/1152x720/BumGt-NWar9P929R.mp4?tag=29

Adopt the contract model: exact colors, type roles, spacing, layout, component behavior, and explicit do/don't rules live in a root `DESIGN.md` that agents can read before touching UI. Adopt Refero's quiet hierarchy, very large hero message, evidence-backed tokens, and clear component prompts. Do not import Linear's dark palette, Notion's product identity, or Refero's card catalogue layout.

### 3. Virtual Cell Challenge quality benchmark

- Live site: https://virtualcellchallenge.org/
- Hero texture: https://virtualcellchallenge.org/homepage/hero-bgnd.png
- Prize-section illustration: https://virtualcellchallenge.org/homepage/prizes-bg.png

Adopt the finish level: a signature hero illustration, abundant intentional whitespace, restrained paper texture, distinct section compositions, prominent data/prize moments, and a deliberate sponsor hierarchy. Do not copy its botanical line art, serif voice, cream palette, page copy, or exact section layouts.

### Reference-to-output matrix

| Reference evidence | Adopt | Concrete output | Reject |
|---|---|---|---|
| Mono-color skill and boards | two-plate discipline, active paper, type/object tension, sparse microtype | violet/ink/paper `DESIGN.md`, trophy-led hero, numbered track system, subtle halftone texture | sepia, generic retro, grunge, copied posters |
| Refero Styles | machine-readable rules and explicit do/don't contract | root `DESIGN.md`, token checks, shared components, reviewer rubric | borrowed product palettes or catalogue UI |
| Virtual Cell Challenge | campaign pacing and institutional polish | varied full-width sections, large evidence moments, sponsor stage, premium responsive finish | botanical identity or direct layout imitation |
| `Linkedin Post 1.psd` | exact identity, trophy, glass, violet period, typography | exported trophy art, OG card, Noto Sans, violet glass system | replacing source assets with generated approximations |

These references set the finish and composition bar. The PSD remains the visual authority whenever a reference rule conflicts with the approved identity.

## Goal

Turn the current documentation-first site into a campaign-grade scientific challenge website while preserving every factual claim, route, anchor, and accessibility affordance. The new site must feel as considered as the Virtual Cell Challenge without borrowing its botanical identity: our trophy, signal ribbon, violet, glass panels, typography, and four-track diagrams remain the unmistakable visual language.

## Source-of-truth order

1. `Linkedin Post 1.psd` controls visual identity.
2. `docs/CONTENT_INVENTORY.md` controls competition facts.
3. Existing HTML controls routes, anchor IDs, detailed rules, equations, biographies, and dataset descriptions.
4. The mono-color skill controls composition grammar only: plate discipline, negative space, type/image tension, and print texture.
5. Refero controls how the rules are recorded in `DESIGN.md`, not the site's appearance.
6. Virtual Cell Challenge controls only the quality bar: whitespace, hierarchy, material detail, imagery, and section pacing.

No copy, date, prize, metric, sponsor role, or dataset fact changes as part of this redesign.

## PSD audit

The source document is 3800×627 px with three 1200×627 artboards and 186 descendant layers. It carries an Adobe RGB (1998) profile; all web exports must be converted to sRGB.

### Identity constants

| Role | PSD value | Web token |
|---|---:|---|
| Primary violet | `#5332F4` | `--bs-violet` |
| Ink | `#07101F` | `--bs-text` |
| Lavender ground | `#F7F5FC` | `--bs-surface` |
| Lavender line | `#E3DBF4` | `--bs-card-border` |
| Mid violet | `#AE99E5` | `--bs-violet-soft` |
| Muted slate | `#5A6378` | `--bs-muted` |
| Display/body family | Noto Sans | `--bs-fontdisplay`, `--bs-fontsans` |
| Code family | IBM Plex Mono | `--bs-fontmono` |

The artwork uses Noto Sans Light, Regular, Medium, and Bold. Myriad Pro appears only as an embedded fallback and must not become a web dependency.

### Signature assets

- **Trophy:** the largest visible `Expansão generativa` smart object contains a 4768×2504 embedded PSB composite. It includes the violet signal sculpture, stone base, soft lilac environment, and ample negative space. This is the homepage hero image.
- **Social card:** artboard `1` is already a complete 1200×627 campaign composition and replaces the current dark Open Graph card.
- **Track system:** artboard `2` defines the 2×2 four-track composition, numbering `01–04`, and the exact labels `CROSS-STIMULUS`, `CROSS-SESSION`, `CROSS-DEVICE`, and `CROSS-USER`.
- **Glass material:** primary action panels use white at roughly 92% opacity; secondary glass tiles use roughly 58% opacity. Borders remain nearly invisible and shadows carry violet rather than black.
- **Violet period:** display headlines finish with a violet full stop. This motif remains deliberate and limited to primary headings.

The 346 MB PSD stays local and is ignored by Git. Only optimized web exports are committed.

## Current-site diagnosis

The current site is factually strong and accessible, but the homepage reads like product documentation:

- A persistent documentation sidebar dominates the first impression.
- The hero contains four paragraphs before the primary action and does not fit cleanly in the initial viewport.
- The code sample competes with the challenge identity; the trophy is absent.
- The page repeats small uppercase eyebrows and bordered cards until sections lose visual distinction.
- `assets/css/landing.css` has grown to 2,967 lines with several late override layers, making refinements unpredictable.
- Several HTML files carry inline styling.
- The Open Graph image belongs to the previous dark visual system.
- The registration action resolves to an email, but most pages first route visitors through `index.html#cta`, adding unnecessary friction.

The redesign preserves the good parts: semantic sections, skip link, responsive tables, code-copy behavior, reduced-motion handling, exact content inventory, organizer portraits, dataset figures, and current routes.

## Chosen design direction

### Campaign-first scientific editorial

The site adopts the PSD’s clean technical campaign identity and the reference site’s visual confidence:

- Large left-aligned typography, not a centered SaaS hero.
- The trophy acts as the first-screen scientific object, not decoration inside a card.
- White/lavender surfaces, one violet accent, cool shadows, and restrained grain.
- Dense technical content moves below a strong narrative opening or onto its existing detail page.
- Four tracks appear as the approved 2×2 system from the PSD.
- Sponsors receive real logo treatment and deliberate space rather than a compressed footer wall.

The X editorial moodboard influences cropping, numbering, and texture. Its serif and risograph styles do not replace the approved Noto Sans identity.

### Mono-color translation for a website

- The homepage has one focal event: the trophy and hero headline behave as one composition.
- The hero reserves a visibly quiet release zone; navigation, metrics, and code never crowd it.
- Violet is the dominant chromatic plate. Ink carries body copy, rules, and metadata. No third UI accent is introduced.
- Paper stays visible across 25%–55% of campaign sections; texture never lowers text contrast.
- A single gesture family—signal/registration rules derived from the PSD—may recur. Doodles, stickers, blobs, and unrelated motifs do not.
- Type may crop, overlap, or lock to the trophy and track numerals, but factual copy remains fully readable.
- Secondary technical pages use the same plate and type rules with calmer editorial-journal layouts; they are not forced into poster compositions.

## Information architecture

### Global header

Every page receives the same compact top header:

- Brand: `EEG/EMG Foundation`
- Links: `Tracks`, `Timeline`, `Start kit`, `Leaderboard`, `Rules`, `Organizers`
- Primary action: `Register`

The header is at most 72 px tall, renders on one line at desktop widths, and becomes a keyboard-operable menu below 900 px. `Register` always uses the same mailto destination and label.

### Homepage sequence

1. **Hero** — trophy visual, challenge name, one claim, one sentence, two actions.
2. **Prior-edition proof** — 1,197 teams, 247 institutions, 50+ countries, 8,622 submissions.
3. **Challenge thesis** — one benchmark, four real generalization shifts.
4. **Four tracks** — approved 2×2 numbered composition with current figures and links.
5. **Evidence strip** — 14 public datasets, 3,700+ subjects, sealed replay, open-source harness.
6. **Timeline** — submission window and NeurIPS handoff in one legible sequence.
7. **Prize and reproducibility** — `$30,000` total and `$2,500` per top-three team per track, with replay requirement.
8. **Sponsors and institutions** — real logos, grouped by function.
9. **Register** — one final action, no competing CTA label.

The homepage keeps the existing anchor IDs `#tracks`, `#timeline`, `#datasets`, `#sponsors`, and `#cta` so external links remain valid.

### Homepage hero copy

- Eyebrow: `EEG/EMG FOUNDATION CHALLENGE · NEURIPS 2026`
- H1: `Train once. Generalize across signals.`
- Supporting sentence: `Four decoding tracks test models across stimuli, sessions, devices, and people.`
- Primary action: `Register your team`
- Secondary action: `Explore the tracks`

The supporting sentence is 11 words. The hero contains no code sample, metric strip, logo wall, or tertiary tagline.

### Secondary pages

All existing pages keep their content and routes but inherit the new header, typography, ground, buttons, footer, and compact page hero. Long-form pages may use a local table of contents inside the content column; the old site-wide sidebar is removed.

- `startkit.html`: code and commands remain the visual focus.
- `leaderboard.html`: tables and formal scoring remain dense, horizontally scrollable, and readable.
- `faq.html`: rules become an editorial numbered list; questions remain direct links.
- `awards.html`: prize amounts become the dominant visual hierarchy.
- `organizers.html`: portraits and affiliations remain primary; card decoration is reduced.
- `ethics.html`: calm reading width and explicit commitments remain primary.
- `track-record.html`: years and participation figures create the rhythm.
- `404.html`: branded recovery page with links to home, start kit, and rules.

## Layout and responsive behavior

- Content max width: 1440 px; reading copy max width: 65 characters.
- Breakpoints: 1200 px, 900 px, 640 px.
- Desktop hero: minimum 680 px, maximum `calc(100dvh - 72px)`, copy on the left, trophy environment filling the right two-thirds.
- Mobile hero: copy first, 4:3 trophy crop second; both CTAs remain visible without horizontal scroll.
- The four tracks are 2×2 above 900 px and one column below 640 px.
- Tables scroll within labelled regions instead of forcing page overflow.
- Sponsor logos reflow from six columns to three and then two.
- No section uses `height: 100vh`; viewport-sensitive sizing uses `dvh`.

## Motion

Motion is restrained and native:

- A single fade/translate reveal for major blocks through `IntersectionObserver`.
- Subtle trophy scale settling on first paint.
- Existing count-up and copy feedback remain.
- Hover uses color and 1–2 px movement; active buttons use `scale(.98)`.
- `prefers-reduced-motion: reduce` disables all nonessential animation.

No animation library, scroll hijacking, custom cursor, or continuously running decorative effect is added.

## Accessibility

- WCAG 2.2 AA contrast for text and controls.
- Visible `:focus-visible` ring on every interactive element.
- Skip link targets the single `<main id="main">`.
- Mobile navigation maintains `aria-expanded`, closes on Escape, and returns focus to its toggle.
- Meaningful images have descriptive alt text; sponsor logos use organization names; purely ambient decoration is hidden from assistive technology.
- Headings remain sequential.
- Touch targets are at least 44×44 px.
- All functionality works at 200% zoom and at 320 px width.

## Performance and robustness budgets

- No framework migration and no runtime dependency.
- Desktop trophy WebP: 2400×1260, at most 700 KB.
- Mobile trophy WebP: 1400×1400, at most 500 KB.
- Open Graph PNG: 1200×627, at most 700 KB.
- Initial homepage transfer: at most 1.8 MB on an empty cache.
- Lighthouse mobile targets: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95.
- Zero console errors and zero broken same-site links.
- Chrome, Firefox, Safari, and iOS Safari receive manual smoke checks.

## Implementation boundaries

- Keep static HTML, CSS, and vanilla JavaScript.
- Reuse `assets/js/ui.js`, `assets/js/eeg.js`, current logos, portraits, dataset figures, and code-block behavior.
- Replace the contents of `assets/css/landing.css` rather than stacking another override stylesheet.
- Keep `assets/css/organizers.css` only for organizer-specific layout.
- Do not invent registration infrastructure; the existing registration email remains the action target.
- Do not add analytics, cookie consent, a CMS, a bundler, a component framework, or a motion dependency.
- Do not commit the PSD or embedded PSBs.

## Acceptance criteria

1. The first viewport visibly matches the PSD identity and clearly communicates the challenge.
2. The trophy renders sharply at desktop and mobile sizes without obscuring hero copy.
3. All eight existing pages share one header/footer system and no old site-wide sidebar remains.
4. Existing routes, content facts, anchor IDs, code examples, equations, and mailto registration remain functional.
5. Automated design checks, content coverage checks, link checks, Lighthouse thresholds, and responsive screenshot review pass.
6. The deployed result is recognizably the same brand as the three PSD artboards and reaches the reference site’s level of hierarchy, imagery, whitespace, and finish.
