# Virtual Cell Typography Recalibration Specification

## Purpose

Recalibrate the EEG/EMG Foundation Challenge website so its typography and spacing carry the calm, institutional, editorial confidence of the live [Virtual Cell Challenge](https://virtualcellchallenge.org/) while preserving the approved EEG/EMG visual identity: violet palette, Noto Sans and IBM Plex Mono families, trophy artwork, pedestal seal, scientific figures, content, navigation, and all nine routes.

This is proportional mimicry, not literal copying. It adopts the reference's hierarchy, weight, rhythm, and interaction scale without copying Geograph, SF Pro, botanical artwork, content, logos, or brand colors.

## Measured Reference

Computed styles were measured from the live reference at 1440px and 390px.

| Role | Reference desktop | Reference mobile |
| --- | --- | --- |
| Body | 16px / 24px | 16px / 24px |
| Hero and overview title | 44px / 60px, weight 500 | 28px / 44px, weight 500 |
| Hero and overview lead | 24px / 36px | 20px / 32px |
| Section heading | 36px / 48px, weight 500 | 24px / 36px |
| Small feature heading | 20px / 32px, weight 500 | 16px / 24px |
| Prominent actions | 20px / 32px | 20px / 32px |
| Section inset | 96px block / 48px inline | 64px block / 24px inline |

The current site reverses the reference's hierarchy: its display headings reach 72–80px at weight 900, while navigation and buttons remain 13.5–14px. The recalibration reduces headline aggression and raises supporting and interactive text.

## Design Read

An existing scientific competition site for research competitors and institutional partners, using a restrained editorial-scientific language. Preserve the asymmetric trophy composition and current information architecture.

- `DESIGN_VARIANCE: 5`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 4`

## Typography Contract

### Families

- Retain `Noto Sans` for display and body text.
- Retain `IBM Plex Mono` for code, tabular figures, dates, metrics, and technical metadata.
- Do not add, download, or imitate Geograph or SF Pro.
- Preserve the current system-font fallbacks and `font-display: swap` behavior supplied by Google Fonts.

### Shared scale

Add these shared CSS custom properties to `assets/css/tokens.css`:

```css
--bs-type-body: 16px;
--bs-leading-body: 1.5;
--bs-type-action: 16px;
--bs-leading-action: 1.5;
--bs-type-lead: clamp(18px, 1.55vw, 20px);
--bs-leading-lead: 1.6;
--bs-type-hero-home: clamp(42px, 4.5vw, 64px);
--bs-type-hero-page: clamp(40px, 4vw, 56px);
--bs-type-section: clamp(32px, 3.4vw, 48px);
--bs-weight-display: 700;
--bs-tracking-display: -0.025em;
```

### Shared body and actions

- Body text: `16px / 1.5` (24px line box).
- Introductory and hero lead text: `clamp(18px, 1.55vw, 20px) / 1.6`.
- Navigation, local navigation, primary buttons, and ghost buttons: `16px / 1.5`.
- Buttons retain a minimum 44×44px target; hero buttons retain 48px minimum height.
- Button radius becomes the existing 8px small radius.
- Primary and ghost buttons lose resting elevation; hover may use the existing card shadow.
- Brand text becomes 16px; the 40px trophy seal and accessible name remain unchanged.

### Display hierarchy

- Homepage H1: `clamp(42px, 4.5vw, 64px)`, weight 800, line-height 1.02, tracking `-0.025em`.
- Secondary-page H1 and 404 H1: `clamp(40px, 4vw, 56px)`, weight 700, line-height 1.08, tracking `-0.025em`.
- Homepage and page section H2: `clamp(32px, 3.4vw, 48px)`, weight 700, line-height 1.1, tracking `-0.02em`.
- Card and feature headings: 20–30px, weight 600–700, line-height 1.25–1.5.
- Remove component-level weight-900 overrides from semantic headings.

### Deliberate exceptions

The following remain oversized and may retain tight tracking or weight 900 because they function as visual data, not reading hierarchy:

- Homepage prize total.
- Awards total.
- Countdown values.
- Proof and evidence figures.
- Track numbers.
- Rule numbers.
- Historical year markers.
- Technical table track identifiers.

Eyebrows and technical metadata remain 10–12px. They are functional labels, not body copy, and must never fall below the existing 10px floor.

## Spatial Contract

- Homepage campaign sections: 96px block and 48px inline at desktop; 64px block and 24px inline below 768px.
- Technical and narrative content sections: 80px block at desktop; 56–64px block on mobile according to current first-fold constraints.
- Organizer sections use the same rhythm as other secondary pages.
- Heading-to-lead gap: 20–24px.
- Section heading group bottom margin: 48px desktop, 36px mobile.
- Keep the current 1344px content maximum.
- Keep hero CTAs visible in the initial 1440×900 and 390×844 viewports.

## Scope by Page Family

### Shared shell

Update the site brand, desktop navigation, mobile navigation, local navigation, buttons, and body floor through shared CSS only. Do not edit repeated header HTML.

### Homepage

Update the campaign hero, section headings, section leads, track headings, and section spacing. Preserve the trophy crop, background feather, proof strip, four large scientific figures, prize numerals, sponsor marks, and content order.

### Technical pages

Apply the shared page H1, lead, section H2, and body rhythm to `startkit.html`, `faq.html`, and `leaderboard.html`. Preserve code, MathJax, tables, phase metadata, and horizontal-scroller behavior.

### Narrative pages

Apply the same hierarchy to `awards.html`, `ethics.html`, `organizers.html`, and `track-record.html`. Preserve award totals, numbered commitments, organizer portraits, institutional marks, and the historical year rail.

### Recovery page

Apply the secondary-page H1 and lead scale to `404.html`. Preserve recovery links and trophy treatment.

## Accessibility and Resilience

- Text contrast remains WCAG 2.2 AA or better.
- Interactive targets remain at least 44×44px.
- Browser text zoom and system fallback fonts must not cause horizontal overflow at 320px.
- The desktop navigation must remain a single line at 1024px and above.
- No content or accessible names change.
- JavaScript-disabled, reduced-motion, missing-IntersectionObserver, and blocked-webfont behavior remain valid.

## Acceptance Criteria

1. Shared typography tokens contain the exact values in this specification.
2. Semantic headings no longer use weight 900 except the documented numeric exceptions.
3. The body computes to 16px / 24px on every route.
4. Site and local navigation compute to 16px and remain one line where the desktop menu is shown.
5. Homepage H1 computes between 42px and 64px; secondary-page H1 between 40px and 56px.
6. Hero and introductory leads compute between 18px and 20px with 1.6 line-height.
7. Homepage and page section headings compute between 32px and 48px.
8. The homepage H1 is at most two lines on desktop and the hero CTAs are visible initially.
9. No viewport has horizontal overflow at 1440, 834, 390, or 320px.
10. All nine routes pass the existing design, link, console, font-fallback, target-size, and visual-detail checks.
11. Fresh screenshots are compared against both the pre-change site and the live Virtual Cell reference for hierarchy and cadence, not pixel identity.
12. No new runtime dependency, font, image, HTML route, or JavaScript behavior is introduced.

## Skill Inventory

### Installed and directly useful

- `design-taste-frontend` — primary design calibration and anti-template constraints.
- `frontend-design` — editorial frontend execution guidance.
- `frontend-design-review` — production design review after implementation.
- `redesign-existing-projects` — preserve-first redesign discipline.
- `design-critique` — structured comparison of reference and implementation.
- `critique-visual-hierarchy` — focused hierarchy review of rendered screens.
- `visual-verdict` — screenshot comparison and release verdict.
- `visual-testing-advanced` — responsive and regression matrix design.
- `web-design-guidelines` — interface-pattern audit.
- `accessibility` — WCAG audit and repair.
- `accessibility-patterns` — focus, target, and semantic validation.
- `performance` — font-loading and render-performance protection.
- `browser-automation` — repeatable browser inspection.
- `chrome-devtools` — computed typography, layout, and console inspection.
- `mono-color` — keeps the one-accent editorial identity coherent; secondary to typography.
- `ui-ux-pro-max` — broad UI/UX heuristic review.
- `impeccable` — final visual polish.
- `ai-slop-cleaner` — remove ornamental or repetitive styling after implementation.
- `superpowers:test-driven-development` — red/green test discipline.
- `superpowers:subagent-driven-development` — task-by-task implementation with two-stage review.
- `superpowers:requesting-code-review` — independent final code review.
- `superpowers:verification-before-completion` — evidence gate before commit or deployment.
- `superpowers:finishing-a-development-branch` — safe integration and deployment handoff.

### Credible optional external skills found through skills.sh

- [`jakubkrehel/skills@better-typography`](https://skills.sh/jakubkrehel/skills/better-typography) — 13.7K installs; source repository has 4.6K stars.
- [`wondelai/skills@web-typography`](https://skills.sh/wondelai/skills/web-typography) — 7.2K installs; source repository has 2K stars.
- [`microsoft/skills@frontend-design-review`](https://skills.sh/microsoft/skills/frontend-design-review) — official Microsoft source; 195 installs and a 2.9K-star repository. A local skill with this role is already installed.
- [`aj-geddes/useful-ai-prompts@visual-regression-testing`](https://skills.sh/aj-geddes/useful-ai-prompts/visual-regression-testing) — 668 installs; source repository has 327 stars. Existing local visual-testing skills already cover this need.

No external installation is required for this implementation. Installing overlapping design skills would add conflicting rules without adding a missing capability.
