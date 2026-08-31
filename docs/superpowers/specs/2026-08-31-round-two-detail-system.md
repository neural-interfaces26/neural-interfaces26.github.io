# EEG/EMG Challenge Round Two Detail System

**Date:** 2026-08-31  
**Status:** Approved for autonomous implementation  
**Baseline commit:** `6b7555e`  
**Primary benchmark:** https://virtualcellchallenge.org/

## Goal

Raise the finished site from a strong identity redesign to a campaign-grade system whose quality survives close inspection. Preserve the approved PSD trophy, palette, typography, facts, routes, accessibility, and performance. Improve the small details that control composition: first-fold hierarchy, optical alignment, repeated visual grammar, spacing cadence, technical density, state communication, and responsive recomposition.

## Evidence and chosen approach

The live benchmark was re-audited across its homepage, data, evaluation, leaderboard, FAQ, rules, archive, terms, privacy, and sign-in routes. Its finish comes from a small shared vocabulary combined with page-specific composition: restrained type scales, 96/48px desktop rhythm, sparse hairlines, one signature image, contextual information planes, aligned internal separators, calm long-form pages, and a true mobile re-composition. We retain our stronger semantic, responsive, focus, and performance baseline rather than importing the benchmark's defects.

Three approaches were considered:

1. **Surface polish only:** adjust shadows, radii, and spacing. Lowest risk, but it leaves seven subpages with the same tall first-fold stack and does not solve page identity.
2. **Shared proof-rail system:** keep the shared shell and content, add a route-specific factual proof rail to each compact hero, compress the repeated announcement into one phase rail, and normalize the violet-rule grammar. This is the chosen approach because it creates differentiated composition with existing facts and no new runtime or artwork.
3. **New route-specific illustration:** create a separate visual for every page. Rejected because it weakens trophy scarcity, introduces decorative work without information value, and conflicts with the two-plate identity.

## Current diagnosis

- The homepage trophy is correctly hard-right on desktop and readable on mobile. It must not move farther or become a small repeated icon.
- Seven secondary pages repeat `.page-hero` plus `.announcement-strip`; four also add `.local-nav`. On mobile this delays substantive content and makes different routes feel like the same template.
- The announcement repeats one long sentence at high visual weight. Ethics adds a separate review-state rail, producing two adjacent state systems.
- Visible metadata reaches 8.5–9.5px even though `DESIGN.md` requires a 10–12px floor.
- The active ruled systems are good, but their label/content rhythm differs across track cards, rules, award rows, metadata blocks, and year entries.
- `landing.css` retains unused gradient, green-state, featured-card, and obsolete override rules. Adding another override layer would compound the problem.
- Awards, the track-record rail, the native leaderboard tables, the start-kit contract, the homepage track field, and the organizer directory are page-specific strengths and must remain intact.

## Binding design decisions

### 1. Trophy and signature imagery

- The trophy remains the homepage's single dominant object.
- The existing restrained trophy use on the 404 and prize treatment may remain.
- Secondary-page differentiation uses facts, rules, and signal geometry, not miniature trophies or new illustrations.
- The reusable gesture is a short violet registration rule joined to fine ink/lavender hairlines.

### 2. Secondary-page first fold

Every secondary page uses this order:

1. shared header;
2. compact page hero with copy on the left and a route-specific factual proof rail on the right;
3. one shared phase rail;
4. local navigation when the page already has one;
5. substantive page content.

The proof rail is open paper with rules, not a card. It has one accessible label, two to four factual rows, IBM Plex Mono for dates/numerals, and exactly one violet left registration mark. It does not repeat the page heading or CTA.

Route proof facts are restricted to content already present on that route:

| Route | Hero proof content |
|---|---|
| Awards | four tracks; three prize places; `$2,500` each; Sydney workshop presentation |
| Ethics | review state; provider approvals; explicit consent; read-only decoders |
| FAQ | seven binding rules; four optional disclosures; canonical rules source; reproducibility audit |
| Leaderboard | preview phase; updates begin Sep 16; four boards; baselines available |
| Organizers | 28 organizers; four tracks; 14 institutions; five countries |
| Start kit | Python ≥3.12; PyTorch ≥2.2; BIDS-first; MIT licensed |
| Track record | 2021→2026; four prior competitions; same lead; same open-source platform |

The phase rail keeps the existing schedule and workshop facts in compact fields. Ethics folds its approval state into the same rail; it must not retain a second adjacent state strip.

### 3. Composition and spacing

- Secondary desktop heroes use a two-column grid and must expose a page-specific fact before scrolling.
- The hero, phase rail, and optional local nav together stay at or below 640px at a 390px viewport, excluding the persistent site header.
- The phase rail is at most 64px tall on desktop and 108px on mobile.
- Major desktop sections target a 96px cadence; internal groups target 48px. Mobile targets are 64px and 24px.
- Every page has one focal event and one quiet release zone. Additional sections may be dense, but they may not compete with the first focal event.
- At 1440px, title copy and proof content align to the same grid. At 390px and 320px, the proof rail stacks after the CTA and never causes page overflow.

### 4. Reusable visual vocabulary

Use the same detail grammar for state, chronology, and quantified proof:

- one short violet registration rule;
- one 1px ink or lavender separator;
- uppercase 10–12px label;
- 16px-or-larger factual value, or a 10–12px mono value in truly dense tables;
- open paper by default.

Rounded glass remains only where containment has a job: code, keyboard-scrollable technical regions, a rules caveat, a sponsor mark, or a primary action. Generic metadata must not become another soft card wall.

### 5. Type and accessibility

- No visible non-code text computes below 10px at 1440, 834, 390, or 320px.
- Body copy remains at least 15px, with long-form pages at 16px where already established.
- All buttons and button-like links retain 44×44px minimum targets.
- The page proof and phase rail use semantic HTML and accessible labels; decorative rules remain hidden from assistive technology.
- No heading level, landmark, anchor, focus, menu, no-JS, or reduced-motion regression is permitted.

### 6. CSS cleanup

- Remove selectors that have no current HTML consumer when they encode obsolete featured cards, green completion state, legacy leaderboard rows, or retired hero/card treatments.
- Remove active gradients from interface surfaces. Trophy image blending and source artwork are exempt only when they are image treatments, not UI fills.
- Do not add a new stylesheet or another late override layer.
- Keep shared rules in `assets/css/landing.css`; keep portrait/directory-only rules in `assets/css/organizers.css`.
- Extend the existing stdlib design gate rather than adding a test framework or runtime dependency.

## Ten visual iteration questions

Each iteration records a screenshot, a pass/fail ruling, any change, and the reason. A no-change ruling is valid when evidence already passes.

1. **Entry point:** does each first viewport have exactly one correct focal event?
2. **Eye flow:** does the title lead to proof, CTA, state, and first content without a dead zone?
3. **Weight:** is there at least a 1.5× hierarchy step between title, supporting fact, and metadata?
4. **Grid:** do title, proof rail, local nav, and first content share intentional edges?
5. **Cadence:** do major and minor spacing intervals read as 96/48 desktop and 64/24 mobile families?
6. **Reuse:** is the violet registration rule the only recurring decorative gesture?
7. **Density:** are code, tables, biographies, rules, and award rows dense without becoming cramped?
8. **Responsive composition:** are 1440, 834, 390, and 320px genuine recompositions with no overflow?
9. **Resilience:** do focus, menu, no-JS, reduced motion, missing IntersectionObserver, and lazy assets remain correct?
10. **Originality and performance:** does the result reach the benchmark's detail level without copying its botanicals, palette, layout, or runtime weight?

## Verification matrix

- Static: design gate, content coverage, JavaScript syntax, Python compilation, `git diff --check`, same-site link validation, and identical shared-script cache keys.
- Visual: all nine routes at 1440×1100, 834×1080, 390×844, and 320×720; full-page lower-content captures for all eight substantive routes.
- Interaction: keyboard navigation, focus visibility, mobile menu open/Escape/focus return, native details, code copy, and keyboard-scrollable tables.
- Resilience: JavaScript disabled, reduced motion, missing IntersectionObserver, font fallback, and lazy-image completion after scroll.
- Performance: preserve the existing deferred-asset behavior and rerun Lighthouse on the homepage and leaderboard only if production CSS/HTML changes affect their measured path.
- Review: each implementation task receives a fresh spec review and code-quality review; the final head receives a fresh whole-branch review.

## Completion criteria

1. All seven secondary heroes expose route-specific proof without new facts or artwork.
2. The repeated announcement becomes one compact phase rail; Ethics has no duplicate state strip.
3. The 390px pre-content stack is no more than 640px; the phase rail is no more than 108px.
4. No visible non-code text is below 10px at any required viewport.
5. The violet registration rule is the only recurring decorative gesture and generic metadata card chrome is reduced.
6. No legacy green UI, active interface gradient, page overflow, focus regression, lazy-load regression, or console error remains.
7. All ten visual iteration questions pass with retained evidence.
8. Lighthouse, accessibility, performance, content, route, and cache-key gates remain at or above the accepted Round One result.
