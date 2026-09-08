# Organizer directory review

Historical visual review against baseline commit `719a4df`, performed 2026-09-08.

Subsequent content update: Ugo Nunes was removed at the organizer’s request; the current directory has 30 profiles and four EEG organizers. Affiliation labels were audited and the EMG collection notes removed. The visual results below describe the earlier 31-profile snapshot.

## Content and sources

- All 29 original people, biographies, and affiliation text are retained.
- The roster contains 31 unique profiles after adding Rick Warren and Tiberiu Tesileanu, both explicitly credited for emg2pose test-data collection.
- Six sections group the four tracks, core/host team, and scientific advisors. Exact memberships are enforced by `scripts/design-check.py`; the EMG section also links to Arnault Caillet's core profile.
- The proposal supports the four track-lead labels. No new leadership role was inferred from a research interest or affiliation.
- New biographies and authentic portrait files are linked to their official personal pages. Photo dates are unverified; see [source provenance](ORGANIZER_SOURCES.md).
- All same-site links/anchors and all 51 organizer-page image files resolve.

## Automated and visual checks

- Applicable design checks pass: typography, tokens, detail rules, shared shell, homepage, narrative pages, metadata, assets, and same-site links.
- Content coverage passes all 60 anchors across nine HTML pages. `git diff --check` passes.
- Chromium reviewed at 1440, 1200, 1024, 900, 834, 640, 390, and 320 CSS pixels: no page overflow, clipped profile text, unloaded images, runtime errors, or console errors.
- New navigation and section links meet 44px target dimensions. Mobile team navigation exposes all six groups in a two-column layout. Keyboard Tab navigation, mobile menu open, Escape close, and focus return were checked.
- All 31 profiles and native team links remain accessible with JavaScript disabled. The review used reduced-motion mode.
- A 640×500 CSS-pixel viewport at 2× device density models 200% scaling of a 1280×1000 window without overflow. This is an emulation, not a native browser-menu zoom test.
- Desktop and mobile screenshots were inspected for team hierarchy, readable bios, portrait framing, and source/contribution visibility. The desktop EMG lead occupies its own row so Rick and Tiberiu are aligned together.

The browser and its libraries were installed only in temporary directories for this review; the site still has no build step or runtime framework dependency. The local preview is served with `python3 -m http.server 4173 --bind 127.0.0.1` from the repository root.

## Existing failures outside this change

The complete `python3 scripts/design-check.py` command still reports nine pre-existing `startkit.html` failures. A separate snapshot of the baseline revision reproduces the same failures:

- Missing expected page-proof aside and its four expected facts (Python, PyTorch, BIDS-first, MIT license).
- Expected two code scrollers and one local navigation.
- Missing expected Track 4 angular-error wording and native four-track contract.

The organizer changes introduce no additional failures. The start-kit content was not changed as part of this directory update.
