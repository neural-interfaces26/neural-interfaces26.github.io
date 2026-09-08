# All-page UX review loop

Goal: a first-time researcher can identify a suitable track, reach its baseline and registration, understand its prize and rules, and recover from a wrong turn without learning the site's internal numbering.

Implementation: Luna (`gpt-5.6-luna`, max reasoning), as requested. Review and browser validation: root; independent screenshot critique: a separate read-only reviewer. Preserve existing facts, brand, and static stack. Keep edits uncommitted.

## Guidance

Installed `jezweb/claude-skills@ux-audit` for workflow comprehension, first-time-user review, interaction evidence and fix/recheck loops. Installed `anthropics/skills@frontend-design` as secondary visual guidance. UX takes priority. Also consulted the installed UI/UX Pro Max navigation guidance on deep links, browser Back, and unobscured sticky navigation.

The audit skill includes Claude-specific tooling and authenticated-app requirements. This public, local static site uses its existing isolated Chrome/CDP driver instead. Form typing, account roles, destructive mutations and seeded record volumes have no local surface and are recorded as not applicable, rather than adding artificial controls or claiming those checks passed.

## Acceptance by page

| Page | First useful decision | Required continuation |
| --- | --- | --- |
| Home | Recognize all four named tasks without reading a manifesto | Go to the selected track's preparation |
| Start kit | See all four track choices together on mobile | Matching guide, registration portal, and leaderboard |
| Prizes | Compare first/second/third awards across four tasks | Start the same track without reselecting it |
| Leaderboard | Identify named board and understand preview status | Run that track's baseline; expand technical scoring only when needed |
| Rules / FAQ | Find eligibility, submission limits and preparation requirements | Return to entering; read expanded answers at a usable width |
| Ethics | Find consent/controller/launch constraints | Contact organizers and return to participation |
| Organizers | Identify the relevant track team | Get help and resume participation |
| Track record | Recognize historical results versus current challenge | Return to the current challenge |
| 404 | Understand a page is unavailable | Recover to tracks, preparation, or help |

## Loop and evidence

1. Record specific problems from the previous desktop/mobile screenshots; independent reviewer drops generic or duplicate issues.
2. Luna implements task-oriented changes across all pages.
3. Run `scripts/ux-audit.mjs`: actual pointer actions, before/after screenshots, browser Back, mobile Tab/Escape, available disclosures, per-page axe checks, console and network inventories. Save timestamped manifest. Run existing navigation/content checks too.
4. Review rendered first decisions, track context, and task endings. Send Luna exact remaining failures with route, width, action, observed outcome and expected outcome.
5. Re-run the affected paths after fixes. Stop only after a review pass has no unresolved high-impact journey failure and all applicable automated checks pass. Report minor remaining issues explicitly.

Do not weaken a functional/accessibility check to make an implementation pass. Retire obsolete template checks that require large proof rails, fixed empty spacing, or a particular count of visible technical snippets; replace them with task and semantic checks.

## Baseline findings accepted by independent review

- High: leaderboard numbers/scientific headings break recognition of the four named tasks.
- High: mobile choice comes too late; all four tasks need a compact visible selector.
- High: prizes and boards lose the selected track when continuing to preparation.
- Medium: sponsor-first prize layout makes comparison slow.
- Medium: expanded scoring implementation dominates empty preview boards.
- Medium: preview boards lack a nearby track-specific baseline action (same patch as continuity).
- Medium: expanded desktop FAQ answers are unnecessarily narrow.

No standalone medium/high defect was established for the previous 404 recovery or organizer grouping. Improve their continuity only where useful; do not invent findings to fill a quota. Baseline evidence is in `/tmp/neural-visual` and `/tmp/neural-journey`.
