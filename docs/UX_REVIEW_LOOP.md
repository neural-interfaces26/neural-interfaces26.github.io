# All-page usability review and fix loop

Status: implementation complete; final scoped regression checks passed. No human participant study has been performed.

Persona: a first-time ML researcher with five minutes to identify a suitable track and find its baseline and registration. Additional tasks: a returning participant resuming a track, and a collaborator checking prizes, rules, or organizers.

Luna (`gpt-5.6-luna`, max reasoning) implements the website changes. Root runs browser interactions and regression checks. A separate read-only reviewer checks screenshots and challenges the findings.

## UX guidance installed and used

- [UX Audit — jezweb/claude-skills](https://www.skills.sh/jezweb/claude-skills/ux-audit): approximately 2,500 installs; repository verified at 999 stars. Installed with `npx skills add jezweb/claude-skills --skill ux-audit -g -y --agent codex`. Its workflow-comprehension guidance drives the review: recognition, next steps, orientation, deep links, predictable Back, and task completion.
- [Frontend Design — anthropics/skills](https://www.skills.sh/anthropics/skills/frontend-design): approximately 866,400 installs; repository verified at 175,191 stars. Installed as secondary guidance. The user's subsequent instruction prioritizes UX over visual styling.
- The already installed UI/UX Pro Max skill supplied targeted navigation guidance for deep links, browser Back, and unobscured sticky navigation. Its disclosure search did not return a relevant match; disclosure guidance comes from UX Audit's workflow-comprehension reference instead.

The UX Audit package specifies Claude-specific browser tools and authenticated-app scenarios. This review adapts the interaction method to the repository's existing isolated Chrome/CDP driver and local static pages. There are no local forms, login roles, destructive operations, or data mutations to exercise. This is a scoped usability review, not a claim of completing that package's authenticated-app certification or of testing real registration/submission.

## Why the first pass was rejected

All 18 page/viewport interaction walks had zero reported axe violations or console/network blockers. That did **not** make the experience acceptable. Rendered review found the following:

| Finding | Observed evidence | Required correction |
| --- | --- | --- |
| Track choice still too late | `startkit-390-0.png`: first track begins around y848; three others remain below it | Show all four named choices together before y844 at 320/390px; remove duplicate introductions |
| Navigation labels overlap | Same screenshot: “Prepare a submission” crosses into “Reference scores” | Wrap labels within their own 44px-minimum targets |
| Prizes fragment into unreadable words | `awards-390-0.png`: “San Francisco internship” split inside a narrow column | Mobile rows expose each labeled prize across a readable width |
| Leaderboard repeats its introduction | `leaderboard-390-0.png`: results panel, another hero, then status before boards | One page title, one preview statement, then named board choices |
| FAQ paragraph width remains narrow | `faq-1440-3.png`: about 195px of usable text despite wide page | Remove percentage padding inside a capped answer width |
| History announces its ending before starting | `track-record-1440-0.png`: closing participation bridge above 2021 | Place the closing bridge after the timeline |

Evidence directory: `/tmp/neural-ux-loop1`. Its timestamped `manifest.json` records actual actions, before/after screenshots, browser Back, mobile Tab/Escape, disclosures, console reads, and network responses. Independent review retained the FAQ/history findings and did not invent defects for working organizer grouping, ethics navigation, or 404 recovery.

## Runnable checks

Use the server and isolated Chrome setup in `UX_VALIDATION.md`, then run sequentially:

```sh
python3 scripts/design-check.py
python3 scripts/coverage-check.py
OUTPUT_DIR=/tmp/neural-journey-final node scripts/journey-check.mjs
OUTPUT_DIR=/tmp/neural-ux-final node scripts/ux-audit.mjs
OUTPUT_DIR=/tmp/neural-visual-final node scripts/visual-detail-check.mjs
```

`ux-audit.mjs` fetches pinned axe-core 4.10.3 into memory for browser testing; it adds no website dependency. Set `AXE_SOURCE=/path/to/axe.min.js` to use a local copy. Recheck an affected slice with `UX_ROUTES=startkit.html,awards.html UX_WIDTHS=390`.

New regression gates check actual rendered text overlap, first-screen track choices, readable mobile prize cells, desktop FAQ paragraph width, and page-title order. The journey suite now follows all four board-to-preparation round trips and checks a malformed fragment cannot disable navigation. Existing content checks retain organizer names, metrics, portals, and baseline data. Obsolete layout requirements for large proof rails and a dominant prize total were replaced with semantic and task requirements.

## Limits

Axe checks selected WCAG 2/2.1 A/AA rules; it does not establish complete accessibility or replace screen-reader testing. Local unthrottled rendering samples do not establish production performance. Recorded event durations are an interaction-latency proxy, not field INP. Off-site account creation and model uploads remain outside this local review. Candidate-specific internship terms will be negotiated separately.

## Corrections verified in the second pass

Eight desktop/mobile walkthroughs of Start kit, awards, leaderboard, and FAQ completed with no reported axe violations, runtime blockers, navigation overlap, cramped prize values, or narrow FAQ paragraphs. At 390px, all four Start kit choices occupy y301–405, compared with only the first choice beginning around y848 in the rejected first pass. Evidence: `/tmp/neural-ux-loop2/manifest.json`.

The homepage chooser now precedes local navigation and detailed track descriptions. Detailed Start kit cards remain one column on narrow screens; the compact four-choice selector stays two columns. The history closing block follows the timeline. Track guides and setup have distinct destinations.

To shorten the final verification after the user's request, the final checks target the changed homepage/Start kit at 390/320px and all four track round trips at 320/1440px, plus the full static content checks. The earlier full visual suite was not rerun after this iteration; its fixed template measurements are not used as proof of current usability.

Final results: four homepage/Start kit mobile walkthroughs passed with zero reported blockers (`/tmp/neural-ux-final/manifest.json`). The scoped journey run passed at 320/1440px, including all four track round trips, no-JavaScript navigation, and malformed-fragment handling. Full design and coverage checks passed (9 pages, 58 anchors, 15 categories).

The final sponsor correction states a paid summer internship in San Francisco: above 50% top-3 accuracy in the best quartile of subjects guarantees negotiation with the winner. Specific details are determined with the candidate; lower scores do not rule out consideration. The internship eligibility bar is separate from the top-5 competition ranking.

## User-rejected visual result: promotion and readability pass

The user rejected the previous result after seeing the deployed layout. Earlier automated successes do not establish visual acceptance. This correction follows `superpowers/plans/2026-09-08-promotion-and-readability.md` and the user's four screenshots.

Observed failures: dominant $18,000 headline instead of internship promotion; logos with inconsistent optical size and a mostly empty compute-partner row; historical participation figures buried at the bottom; duplicated prize breakdown and dense conditions; repeated FAQ introductions and oversized rule gutters; organizer affiliations separated from names, with an inconsistent full-width EMG lead.

Baseline local captures: `/tmp/baseline-prize-heading.png`, `/tmp/baseline-sponsors.png`, `/tmp/baseline-track-prizes.png`, `/tmp/baseline-rules.png`, `/tmp/baseline-team-emg.png`. The previous homepage chooser correction is retained.

Status: corrected implementation and final navigation regression complete; rendered desktop/mobile review complete. This section supersedes the earlier completion statement for visual acceptance.

Implemented: historical statistics immediately after the hero; awards/internship promotion with a direct CTA; compact compute and sponsor row with optical logo sizing and centered wrapping institutions; a single prize comparison with direct track links; separate San Francisco/Toronto conditions; compact visible rules and native FAQ answers; uniform organizer cards with affiliations beneath names. All 30 names, affiliations and biographies compare exactly with the pre-edit snapshot.

The first correction audit completed 12 route/viewport walks (four affected pages at 1440, 390 and 320px), with zero reported blockers: `/tmp/neural-promotion-review/manifest.json`. Rendered review additionally corrected the mobile horizontal rule index and the optical size of Reality Labs. Section screenshots are in `/tmp/promotion-*.png`. Source checks requiring deleted prize-card typography and fixed organizer padding were retired; organizer membership, content, link and accessibility requirements remain.

Final validation: all 36 page/viewport navigation cases passed across nine pages at 1440, 834, 390 and 320px, including four-track round trips, malformed fragments, and no-JavaScript mobile navigation (`/tmp/neural-promotion-journey/results.json`). Six final interaction/axe walks of homepage, FAQ and organizers at 1440/320px reported zero blockers (`/tmp/neural-promotion-final/manifest.json`). All seven binding rules match the pre-edit text. Full design and content coverage checks pass: nine pages, 58 anchors, 15 categories. Final section captures use `/tmp/promotion-final-*.png`.

These are local functional, accessibility and rendered-layout checks; no participant study, external registration or submission, or production-performance claim is made. Validation was completed locally before committing this correction pass.

## Supplied Organizers v2 design

Applied the page body, scoped stylesheet and 13 trimmed logos from the user-provided ZIP. Preserved the current Analytics/SEO shell, all 30 names, affiliations and biographies, the working ISAE-SUPAERO image, and the requested removal of the EMG support note. The ZIP and export support scripts are not published.

Four organizer walkthroughs at 1440, 834, 390 and 320px reported zero blockers (`/tmp/neural-organizers-v2/manifest.json`). Additional section navigation and logo-loading checks ran at 1440, 390 and 320px. Rendered desktop team/logo and 320px core-team screenshots were reviewed against the supplied design. Full design and coverage checks pass.
