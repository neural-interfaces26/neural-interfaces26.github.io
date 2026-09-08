# Participant journey validation

The later [all-page UX review loop](UX_REVIEW_LOOP.md) supersedes the layout-only conclusions below and adds interaction evidence plus independent review.

The participation hub is `startkit.html#enter`. A homepage track card leads directly to its matching hub card; registration no longer depends on finding and opening a FAQ accordion.

## Automated acceptance checks

| Participant goal | Expected path | Evidence |
| --- | --- | --- |
| Start from the homepage | Primary action → visible track chooser | Real browser click; destination URL checked at four widths |
| Prepare a specific track | Track card → matching NeuralBench guide | Exact guide destinations checked for all four tracks |
| Register | Track card → matching Codabench competition | Exact portal IDs checked; wrong-track mutation rejected |
| Inspect results | Track card → corresponding leaderboard section | Real navigation to track 4 and visible destination checked |
| Find prizes | Prizes in every page's primary navigation | Checked on all nine pages |
| Navigate on a phone | Menu opens; Escape closes and restores focus | Checked at 834, 390, and 320px |
| Navigate without JavaScript | Mobile primary links remain visible and usable | Browser script execution disabled; 44px targets checked |
| Use narrow screens | No document or body horizontal overflow | Nine pages at 1440, 834, 390, and 320px |

`node scripts/journey-check.mjs` passed all 36 page/viewport cases, four-track destination checks, entry and leaderboard handoffs, and the no-JavaScript case. It writes `results.json` and seven screenshots to `/tmp/neural-journey` (override with `OUTPUT_DIR`). The first six screenshots cover homepage, registration chooser, and prize configuration on desktop and mobile; the seventh records the navigation fallback.

`python3 scripts/design-check.py` and `python3 scripts/coverage-check.py` pass. The latter checks 58 content anchors across 15 categories. The former retains the site's accessibility and content contracts and now checks actual entry cards instead of removed start-kit code snippets and a former table layout.

A deliberate mutation changed the EMG portal from `17984` to `17974`. The design check failed with the track-4 destination error, and the original file was restored. This confirms the check can reject a plausible but wrong destination.

All seven linked NeuralBench pages returned HTTP 200 on September 8, 2026. The official submission guide still describes an expected workflow and does not supply the final package format; the website explicitly reflects that limitation.

The visual suite also passed: 36 viewport captures, eight full-page captures, and nine font-fallback captures, including typography, target sizes, overflow, browser errors, and keyboard code-scroller checks. Evidence is in `/tmp/neural-visual/summary.json` and the adjacent 53 screenshots. The review found and fixed oversized first-screen introductions at 320px.

## Run locally

Start the static server from the repository root in one terminal:

```sh
python3 -m http.server 4173
```

Start a separate headless Chrome instance in another terminal (macOS):

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --disable-background-timer-throttling \
  --disable-renderer-backgrounding --disable-backgrounding-occluded-windows \
  --remote-debugging-port=9226 --user-data-dir=/tmp/neural-ux-validation about:blank
```

Run the checks sequentially:

```sh
python3 scripts/design-check.py
python3 scripts/coverage-check.py
node scripts/journey-check.mjs
OUTPUT_DIR=/tmp/neural-visual node scripts/visual-detail-check.mjs
```

Node must provide built-in `fetch` and `WebSocket` (validated with Node 26). `BASE_URL` and `CDP_PORT` can override the local server and isolated Chrome endpoints. Do not point the tests at a personal browser session. Every failed assertion exits nonzero; journey failures name the page and viewport.

## Human usability test — not yet performed

Ask five people unfamiliar with the website to complete these tasks, without explaining the navigation:

1. Find the track for hand-pose prediction and its starter guide.
2. Find where to register for that same track.
3. Find the sleep track's first-place prize and its alternative.
4. Find when submissions open and where to ask a question.
5. Find the EMG leaderboard, then return to preparing a model.

For each task, record completion, elapsed time, wrong turns, and whether help was needed. Suggested acceptance gate: at least four of five participants complete each task unassisted within 90 seconds; nobody registers for the wrong track. Investigate the first incorrect navigation choice before adding more visual decoration.

These browser checks establish functional paths, visible destinations, and layout constraints. They do not prove ease of use, test a screen reader, create Codabench accounts, or upload a model. Actual registration and submission require a separate end-to-end check when the portal workflow is available. Alljoined confirmed the internship eligibility bar: above 50% top-3 accuracy in the best quartile of subjects guarantees negotiation with the winner for a paid summer internship. Specific terms are determined with the candidate; lower scores do not rule out consideration. This is separate from the top-5 competition ranking.

## Design guidance used

The requested find-skills workflow found an already installed fit: [Vercel web-design-guidelines](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines), listed at approximately 617,100 installs when checked; its [source repository](https://github.com/vercel-labs/agent-skills) had 30,969 stars. No additional installation was needed. For another environment: `npx skills add vercel-labs/agent-skills --skill web-design-guidelines`.

The [Refero Notion reference](https://styles.refero.design/style/2bf4c61f-de10-4614-ba1b-20c0453bd2a9) informed content hierarchy and restrained surfaces. The local redesign-existing-projects skill guided the changes within the existing stack. The challenge's violet visual identity remains authoritative in `DESIGN.md`.
