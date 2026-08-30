# Task 4 Refinement: Ten Rendered Critique Passes

Design read: a scientific campaign homepage for researchers, competitors, and sponsors, using a precise editorial-print language and the PSD violet trophy system.

Global dials: `DESIGN_VARIANCE 7`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 4`.

Evidence rule: every screenshot in this ledger was captured after network idle with reduced motion unless the pass explicitly tests another mode. Virtual Cell captures were used only to compare pacing and scale. The PSD identity, page facts, layout, and assets remain original.

## Pass 01: Hierarchy

Screenshots:

- `/tmp/neural-task4-iter-01-1440.png`
- `/tmp/neural-task4-iter-01-1024.png`

Observation: the independent review measured the 1440px H1 at about 66.2px, too close to section-heading scale. The trophy remained visually louder than the campaign thesis.

Change: added a large-desktop type step while retaining the existing responsive scale below 1200px. No copy or font-family change was made.

Objective result: at 1440px the H1 computes to `83.52px`, stays exactly two lines, spans x=58 to x=1062, keeps the CTA at y=645 inside the 900px viewport, and creates zero horizontal overflow. At 1024px it remains two lines at `55.296px` with zero overflow. The stronger hierarchy exposes the art collision clearly, which is the subject of Pass 02.

## Pass 02: Desktop trophy geometry

Screenshots:

- `/tmp/neural-task4-iter-02-1440.png`
- `/tmp/neural-task4-iter-02-1024.png`

Observation: the source image and viewport have nearly matching aspect ratios, so `object-position` could not move the centered trophy. Dense ribbons crossed the middle of the headline and the object did not own the right edge.

Change: moved the complete art layer with responsive transform geometry, added a restrained 1.06 scale only above 1320px, used a smaller 0.82 scale in the 901-1199px bridge so the full object can sit right, and faded only the ambient left edge with a transparency mask. The approved bitmap itself is unchanged. The 1440px H1 was optically settled at exactly 80px.

Objective result: at 1440px the sculpture is a decisive right-edge object with its full stone base visible, the dense ribbon field clears the headline glyphs, the H1 remains two lines at `80px`, and overflow is `0px`. At 1024px the complete object occupies the right field, the H1 stays readable at `52px`, navigation remains one line, and overflow is `0px`.

## Pass 03: Tablet trophy crop

Screenshots:

- `/tmp/neural-task4-iter-03-1440.png`
- `/tmp/neural-task4-iter-03-768.png`

Observation: in the stacked 768px composition, the unscaled 16:9 source made the trophy read as a small specimen with too much ambient image around it.

Change: clipped the tablet art stage and scaled the existing source to 1.45 around its center. The mobile source is explicitly reset to its native geometry below 768px, so this crop is tablet-specific.

Objective result: at 768px the full waveform and stone base remain recognizable, the object now occupies the central signature field rather than floating as a thumbnail, the H1 remains exactly two lines at `52px`, the CTA stays above the art, and page overflow is `0px`. The 1440px geometry from Pass 02 is unchanged.

## Pass 04: Mobile first view at 390px and 320px

Screenshots:

- `/tmp/neural-task4-iter-04-1440.png`
- `/tmp/neural-task4-iter-04-390.png`
- `/tmp/neural-task4-iter-04-320.png`

Observation: the complete mobile headline and primary CTA were visible, but at 320x568 the secondary CTA ended 30px below the first viewport. The vertical release above the eyebrow was larger than needed on this narrow height.

Change: reduced only the mobile copy-stage top padding and internal headline/support spacing. The deliberate mobile line break, type size, button size, copy, and 4:3 trophy stage were preserved.

Objective result: at 390px the H1 is three complete lines with x=20 to x=370 bounds and both CTAs end at y=497. At 320px the H1 is four complete lines with x=20 to x=300 bounds and both CTAs end at y=558 inside the 568px viewport. Both widths have `0px` overflow, one-line button labels, and the complete mobile trophy immediately follows the copy.

## Pass 05: Type floor and navigation fit

Screenshots:

- `/tmp/neural-task4-iter-05-1440.png`
- `/tmp/neural-task4-iter-05-1024.png`

Observation: track prose at 14px, timeline prose at 13px, and desktop navigation at 13px fell below the institutional reading floor. Simply enlarging navigation risked wrapping at 1024px.

Change: raised primary campaign copy to 16-17px, timeline copy to 15px, essential metric metadata to 11-12px, the dataset disclosure to 16px, and navigation plus its Register action to 14px. Added a scoped 901-1100px header gutter and gap adjustment so the larger navigation retains the Task 3 shell behavior.

Objective result: computed track prose is `16px`, timeline prose is `15px`, and navigation is `14px`. At 1024px all seven navigation actions share one top coordinate, the menu remains inside x=461 to x=1000 with 24px page gutters, and overflow is `0px`. At 1440px the menu is also one line and the hero geometry is unchanged.

## Pass 06: Track scanning order

Screenshots:

- `/tmp/neural-task4-iter-06-1440.png`
- `/tmp/neural-task4-iter-06-768.png`

Observation: the ruled matrix reads in the required row-major sequence, with ordinal, shift, track name, figure, description, facts, metric/sponsor, and `View track` forming a consistent scan path. At 768px the two columns remain 352px each, while true mobile already collapses to one full-width column.

Change: no change. Altering the established order or forcing a premature tablet stack would reduce the useful side-by-side comparison and diverge from the binding 2x2 campaign sequence.

Objective result: DOM and rendered order are `01 EEG-to-IMG`, `02 BCI decoding`, `03 Sleep onset`, `04 EMG-to-Text` at both widths. Card widths are 672px at 1440 and 352px at 768, figures precede the now-16px descriptions, destinations remain aligned at the card foot, and both renders have `0px` page overflow.

## Pass 07: Evidence versus timeline distinction

Screenshots:

- `/tmp/neural-task4-iter-07-1440.png`
- `/tmp/neural-task4-iter-07-1440-timeline.png`
- `/tmp/neural-task4-iter-07-390.png`
- `/tmp/neural-task4-iter-07-390-timeline.png`

Observation: the two sections already use different information models. Evidence is a pale-lavender field with one rounded white metric container; timeline is a white field with one chronological rule, unequal date columns, and no container. Mobile turns the evidence container into four horizontal bands and the timeline into a vertical reading sequence.

Change: no change. Adding further visual devices would weaken the mono-color restraint, while making the two sections share a card or list treatment would erase their semantic distinction.

Objective result: evidence computes to `#F7F5FC` with four equal 336px columns at 1440 and one 350px column at 390. Timeline computes to white with unequal 324/294/340/386px columns at 1440 and one 326px vertical sequence at 390. Both mobile and desktop captures have `0px` overflow and visibly different pacing.

## Pass 08: Prize dominance, trophy, and logo normalization

Screenshots:

- `/tmp/neural-task4-iter-08-1440.png`
- `/tmp/neural-task4-iter-08-1440-sponsors.png`
- `/tmp/neural-task4-iter-08-390.png`
- `/tmp/neural-task4-iter-08-390-sponsors.png`

Observation: the prize already had the correct sparse, type-led hierarchy at 154px desktop and 85.8px mobile, with the supplied trophy acting as a quiet lower-edge echo. Sponsor CSS, however, flattened every source mark to the same 44px cap and neutralized the existing `--lg`, `--xl`, and UCSD optical modifiers.

Change: retained the prize composition and restored scoped sponsor size roles: base 36px, large 44px, extra-large 52px, and UCSD 40px on desktop, with proportionate 30/36/42/36px mobile caps. Source artwork, logo grouping, links, and cells are unchanged.

Objective result: the prize remains the sole 154px type event on desktop with its trophy visibly subordinate. Sponsor marks now use deliberate optical classes rather than one flattened cap; measured desktop heights are 36/44/52px and mobile heights are 30/35/42px after intrinsic aspect constraints. All source marks remain complete and page overflow is `0px`.

## Pass 09: Normal, reduced, no-JS, keyboard, and anchor stability

Screenshots:

- `/tmp/neural-task4-iter-09-1440.png`
- `/tmp/neural-task4-iter-09-390.png`
- `/tmp/neural-task4-iter-09-390-nojs.png`
- `/tmp/neural-task4-iter-09-390-keyboard.png`

Observation: `.reveal` previously hid content in base CSS, so a missing or failed script could leave campaign content permanently transparent. Anchor targets also relied only on section padding rather than declaring the sticky-header offset.

Change: made reveal content visible by default. `initReveals()` now constructs and attaches the observer first, then installs the `.reveal-ready` root class that enables hidden starting states. Reduced motion and missing IntersectionObserver never install that class and reveal immediately. Added a 72px scroll margin to in-main anchors.

Objective result: normal mode installs `.reveal-ready`, reveals every observed element, reports zero hidden elements, and produces no console/page errors. Reduced motion, no JavaScript, and missing IntersectionObserver all keep opacity at `1`; no-JS content retains real layout height. Keyboard Enter opens the mobile menu, Escape closes it and returns focus, and the focused toggle has the visible violet halo. Keyboard activation of `Explore the tracks` preserves `#tracks` and leaves the target at y=95 below the 72px sticky header. Every tested mode has `0px` overflow.

## Pass 10: Settled whole-page gestalt

Screenshots:

- `/tmp/neural-task4-iter-10-1440.png`
- `/tmp/neural-task4-iter-10-390.png`

Observation: after scrolling every lazy image into view, the complete page reads as a sequence of deliberately different families: editorial cover, proof ledger, 65/35 thesis, ruled track matrix, pale evidence field, chronological line, type-led prize, logo stage, and compact registration close. The Virtual Cell references confirm the value of scale changes and release between sections, while the neural trophy, type, colors, rules, content order, and responsive structures remain specific to this campaign.

Change: no change. A further decorative layer, copied botanical pacing device, or new layout mutation would compete with the now-established trophy event and violate the mono-color restraint.

Objective result: all lazy images report loaded in both full-page captures. The 1440px page is 6786px tall with an 80px two-line H1, CTA at y=641, and `0px` overflow. The 390px page is 10327px tall with a 48.36px three-line H1, CTA at y=500, and `0px` overflow. Both report exact computed ink `#07101F`, lavender `#F7F5FC`, violet `#5332F4`, ink rules, and zero console/page errors.

## Ten-pass verdict

Frictionless: pass. Registration is the single primary action, remains visible in the first view, and keyboard/anchor paths are stable.

Quality craft: pass. The focal hierarchy, responsive object geometry, type floors, exact tokens, source imagery, sponsor optics, focus treatment, motion fallback, and no-JS behavior meet the Task 4 contract.

Trustworthy: pass for this static informational surface. Facts, routes, source marks, evaluation details, and registration destinations are preserved without generated claims or imagery.
