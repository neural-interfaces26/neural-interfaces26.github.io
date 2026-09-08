# Participant Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a participant choose a track, prepare a model, find registration, compare prizes, and get support without searching unrelated pages.

**Architecture:** Keep the existing static HTML and shared CSS. Use the start-kit page as the entry point, with four native link groups and stable track anchors. Reuse the existing Chrome DevTools test driver for behavioral checks; do not add a browser framework.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Python standard library, Node.js and Chrome DevTools Protocol.

**Spec:** `DESIGN.md`, participant journey addendum; user corrections in the current working tree take precedence over historical proposal content.

## Global Constraints

- Preserve the existing violet palette and Noto Sans typography.
- No new runtime dependencies.
- Minimum 44px action targets; visible keyboard focus; no document overflow at 320px.
- Preserve the approved organizer, Discord, prize, and registration corrections.
- Do not invent a final submission package format or an internship threshold calculation.
- Keep changes uncommitted for review.

## Task 1: Make the entry path explicit

**Files:** Modify all nine root HTML pages, `assets/css/landing.css`; test `scripts/journey-check.mjs`.

**Interfaces:** Homepage track links resolve to `startkit.html#enter-1` through `#enter-4`. Header registration resolves to `startkit.html#enter`. Each `article.entry-track` contains a guide, Codabench link, and leaderboard link.

- [x] Inspect the existing mobile first screens and read the official starter-kit and submission documentation.
- [x] Replace header Timeline with Prizes; retain Dates in the homepage section navigation.
- [x] Replace homepage registration detour with the visible track chooser. Move previous-year participation statistics below current competition information.
- [x] Add four track cards and the choose → baseline → submission section navigation; correct the main documentation URL and published EMG guide.
- [x] Check all four routes and exact external destinations with the browser assertion below; each wrong track destination must fail.

```js
assert.equal(await page.eval("document.querySelector('#enter-4 a.bs-btn.ghost').href"),
  'https://www.codabench.org/competitions/17984/');
```

## Task 2: Validate participant behavior

**Files:** Modify `scripts/visual-detail-check.mjs`, `scripts/design-check.py`; create `scripts/journey-check.mjs`.

**Interfaces:** Export `open(route, width, height, blockedURLs = [])`, `press(page, key, code, virtualKeyCode)`, and `screenshot(page, path, options = {})` from the existing CDP runner. Importing it must not execute its visual suite. Environment: `BASE_URL`, `CDP_PORT`, `OUTPUT_DIR`.

- [x] Guard the existing runner with a direct-execution check and export the existing helpers; retain its standalone command.

```js
import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
```

- [x] Add browser assertions for every header, viewport containment, visible homepage entry CTA, track-specific guide and portal mapping, navigation to the chosen track, and mobile menu open/Escape/focus restoration.
- [x] Navigate using rendered links, verify resulting URL and visible target, and save screenshots at 1440px and 390px. Test containment also at 834px and 320px.
- [x] Replace obsolete start-kit implementation checks (two removed code snippets and an absent contract table) with checks for four labeled entry cards and correct guide/portal/leaderboard destinations. Preserve baseline values and all other accessibility checks.
- [x] Verify the test detects a wrong portal by temporarily substituting one destination, running the affected check, and restoring the original file in a `finally` block.

Run:

```sh
python3 scripts/design-check.py
python3 scripts/coverage-check.py
OUTPUT_DIR=/tmp/neural-journey node scripts/journey-check.mjs
OUTPUT_DIR=/tmp/neural-visual node scripts/visual-detail-check.mjs
```

Expected: static checks pass; all participant paths and viewport checks pass; browser suites exit nonzero on a failed assertion. A failure reports the route and viewport, not only a screenshot filename.

## Task 3: Review evidence and close gaps

**Files:** Modify `DESIGN.md`; create `docs/UX_VALIDATION.md`.

**Interfaces:** The validation report records commands, observed outcomes, screenshot directory, and limitations. It must distinguish browser automation from actual participant usability research.

- [x] Inspect mobile and desktop screenshots of the homepage, chooser, and prize page. Correct clipped labels, hidden destinations, misleading statuses, or oversized prize declarations.
- [x] Run the visual suite with font fallback and check browser errors. Re-run affected checks after fixes.
- [x] Record each journey, action count, pass/fail evidence, and remaining uncertainty. External account creation and actual model submission are outside local browser verification.
- [x] Offer a short moderated usability protocol: a new participant finds a suitable track, setup guide, registration, prize conditions, and Discord without assistance; record completion, wrong turns, and elapsed time. Do not claim this study was run.

## Self-review

All requested UX changes map to Task 1, runnable behavioral validation to Task 2, and evidence plus human usability validation to Task 3. Exact link contracts are defined above. No backend, new framework, publishing, or commits are required.
