# EEG/EMG Challenge Round Two Detail System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Differentiate every secondary page and raise close-range visual quality through route-specific proof rails, a compact shared competition-state rail, a unified ruled detail grammar, a 10px microtype floor, and adversarial visual QA.

**Architecture:** Keep the static HTML/CSS/vanilla-JS architecture and the existing shared shell. Extend the existing Python design gate, establish the shared proof/state components on the three technical routes, apply them to four narrative routes, remove conflicting dormant CSS, and finish with a dependency-free Chrome DevTools Protocol geometry/screenshot gate plus ten focused critique passes.

**Tech Stack:** Static HTML5, CSS Grid/Flexbox/custom properties, vanilla JavaScript, Python 3 stdlib, Node.js native `WebSocket`, installed Google Chrome, Lighthouse CLI.

**Spec:** `docs/superpowers/specs/2026-08-31-round-two-detail-system.md`

## Global Constraints

- `Linkedin Post 1.psd` remains the visual authority; the real trophy is not redrawn, regenerated, or replaced.
- The trophy remains the homepage's dominant object and is not repeated as a small secondary-page decoration.
- Exact interface colors remain `#5332F4`, `#07101F`, `#F7F5FC`, and `#E3DBF4`; no third UI accent is introduced.
- Noto Sans remains display/body; IBM Plex Mono remains dates, code, tabular values, and compact technical metadata.
- No visible non-code text may compute below `10px` at 1440, 834, 390, or 320 CSS pixels.
- Keep all facts, biographies, routes, anchors, equations, code, sponsor roles, dates, and registration destinations unchanged.
- Keep static HTML/CSS/vanilla JavaScript; add no framework, build tool, animation library, or runtime dependency.
- Keep the existing accessibility baseline: semantic landmarks, skip link, sequential headings, keyboard menu, Escape/focus return, visible focus, native tables/details, 44px targets, no-JS visibility, and reduced-motion visibility.
- The page may not overflow at `320px` or `200%` zoom; tables and code remain in labelled internal scrollers.
- Preserve the accepted Round One performance evidence: homepage Lighthouse median ≥90, leaderboard median ≥85, other categories ≥95, initial homepage transfer ≤1.8MB, no eager sponsor/figure loading.
- Reference grammar may guide pacing, hierarchy, and component finish; do not copy Virtual Cell's botanicals, palette, page arrangement, typography, copy, or runtime architecture.
- Each task starts with a failing gate or retained screenshot, implements the smallest root-cause change, reruns focused and global checks, receives fresh review, and ends in its own commit.

---

## File Map

### Create

- `scripts/visual-detail-check.mjs` — dependency-free CDP geometry, typography, console, and screenshot matrix used by the final iteration task.
- `.superpowers/sdd/2026-08-31-round-two/iterations.md` — retained ten-pass visual evidence ledger; this directory is operational evidence and may remain ignored.

### Modify

- `DESIGN.md` — records the secondary-page proof/state grammar, 10px floor, and trophy-scarcity rule.
- `scripts/design-check.py` — statically enforces microtype, prohibited legacy styling, proof/state structure, preserved facts, and obsolete-class removal.
- `assets/css/base.css` — raises the shared badge floor.
- `assets/css/landing.css` — removes dormant first-round styling and implements proof rails, compact challenge state, nav underline, and normalized ruled metadata.
- `assets/css/tokens.css` — removes aliases used only by deleted legacy gradients/completion states.
- `assets/css/organizers.css` — only if the organizer proof rail needs directory-specific optical sizing; do not move shared proof rules here.
- `startkit.html`, `faq.html`, `leaderboard.html` — technical first-fold composition.
- `awards.html`, `ethics.html`, `organizers.html`, `track-record.html` — narrative first-fold composition.

### Preserve

- `index.html` hero composition and trophy position.
- `404.html` restrained trophy recovery composition.
- `assets/img/brand/*`, `assets/img/figures/*`, `assets/img/people/*`, `assets/img/logos/*`.
- `assets/js/ui.js` behavior unless QA identifies a genuine interaction regression.
- `scripts/coverage-check.py` facts/anchor gate.

---

### Task 1: Detail Contract, Microtype Floor, and CSS Hygiene

**Files:**
- Modify: `DESIGN.md`
- Modify: `scripts/design-check.py`
- Modify: `assets/css/tokens.css`
- Modify: `assets/css/base.css:210-221`
- Modify: `assets/css/landing.css:1280-1295, 1588-1627, 1660-1720, 1757-1873, 1895-2000, 2650-2670, 2725-2740, 2818-2840`

**Interfaces:**
- Consumes: the existing `check_tokens(errors)` design gate and the current stylesheet cascade.
- Produces: `check_detail_css(errors)` and `python3 scripts/design-check.py --scope detail`; later tasks rely on this scope remaining green.

- [ ] **Step 1: Add the failing detail gate**

Add this function to `scripts/design-check.py` after `check_tokens`:

```python
def strip_css_comments(css: str) -> str:
    return re.sub(r"/\\*.*?\\*/", "", css, flags=re.DOTALL)


def check_detail_css(errors: list[str]) -> None:
    styles = {
        name: strip_css_comments((ROOT / name).read_text(encoding="utf-8"))
        for name in (
            "assets/css/tokens.css",
            "assets/css/base.css",
            "assets/css/landing.css",
            "assets/css/organizers.css",
        )
    }
    for name, css in styles.items():
        for match in re.finditer(r"font-size\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)px", css):
            if float(match.group(1)) < 10:
                line = css.count("\\n", 0, match.start()) + 1
                errors.append(f"{name}:{line}: fixed font-size below the 10px detail floor")

    landing = styles["assets/css/landing.css"].lower()
    forbidden = {
        "linear-gradient(": "interface gradients are not allowed",
        "rgba(31, 122, 72": "legacy green completion color remains",
        ".vb-track.featured": "unused featured-track styling remains",
        ".phase-card.done": "unused completion-state styling remains",
        ".vb-leader-row": "unused legacy leaderboard styling remains",
    }
    for token, message in forbidden.items():
        if token in landing:
            errors.append(f"assets/css/landing.css: {message}")
```

Add `"detail"` to the `--scope` choices, add `"detail": check_detail_css` to `checks`, and include `check_detail_css` in the `all` scope exactly once.

- [ ] **Step 2: Run the new gate and record RED**

Run:

```bash
python3 scripts/design-check.py --scope detail
```

Expected: FAIL reports fixed values below 10px plus the legacy gradient, green completion, featured-track, completion-state, and leaderboard selectors.

- [ ] **Step 3: Extend the machine-readable design contract**

Append a `## Round Two detail grammar` section to `DESIGN.md` containing these binding statements:

```markdown
## Round Two detail grammar

- The trophy is the homepage's dominant object. Secondary pages use factual proof and the violet registration rule, never miniature trophy decoration or new route artwork.
- Every secondary hero has one left copy column and one right factual proof rail on desktop; the proof stacks after the CTA on mobile.
- Every secondary route has one compact competition-state rail. Ethics merges provider approval state into this rail instead of adding a second strip.
- Proof/state/meta rows use open paper, a 1px separator, uppercase 10–12px labels, and one short violet registration rule. Rounded glass is reserved for code, technical scrollers, rules caveats, sponsor marks, and primary actions.
- Visible non-code text has a 10px computed-size floor. Density comes from spacing, measure, and alignment, never unreadably small type.
- Secondary first-fold order is header → hero → competition state → existing local navigation → substantive content.
```

- [ ] **Step 4: Remove obsolete CSS at the root**

Before deletion, prove the retired selectors have no HTML consumer:

```bash
rg -n 'featured|phase-card (done|active|upcoming)|vb-leader-row' -- *.html
```

Expected: no matches.

Delete the complete `.vb-track.featured` block, `.phase-card.done`, `.phase-card.active`, `.phase-card.upcoming`, and `.vb-leader-row` rules. Keep the base `.phase-card` workflow styling used by `startkit.html`.

Remove `--bs-success`, `--bs-code-bg-soft`, and `--bs-violet-bright` from `assets/css/tokens.css` after confirming they have no remaining consumer:

```bash
rg -n 'bs-success|bs-code-bg-soft|bs-violet-bright' assets/css *.html
```

Expected before token deletion: only the token definitions remain.

- [ ] **Step 5: Remove active interface gradients and raise every fixed microtype declaration**

Replace the organizer avatar fallback:

```css
.org-card .avatar {
  background: var(--bs-violet-wash-2);
  box-shadow: inset 0 0 0 1px var(--bs-card-border);
}
```

Raise `.bs-badge`, `.phase-card .phase-tag`, `.phase-card .phase-tag .badge`, `.ds-row.head`, `.ds-new-tag`, `.vb-stat .bs-kicker`, `.vb-cd-unit`, and every remaining fixed `font-size` under `10px` to exactly `10px`. Do not reduce letter spacing below `0.04em`; preserve dense layout with padding changes only when a row wraps.

- [ ] **Step 6: Run focused and global checks**

Run:

```bash
python3 scripts/design-check.py --scope detail
python3 scripts/design-check.py --scope all
python3 scripts/coverage-check.py
git diff --check
```

Expected: all commands PASS.

- [ ] **Step 7: Commit the contract and cleanup**

```bash
git add DESIGN.md scripts/design-check.py assets/css/tokens.css assets/css/base.css assets/css/landing.css
git commit -m "design: enforce the round two detail grammar"
```

---

### Task 2: Technical-Page Proof Rails and Compact Competition State

**Files:**
- Modify: `scripts/design-check.py`
- Modify: `assets/css/landing.css:3251-3320, 3590-3610`
- Modify: `startkit.html:68-108`
- Modify: `faq.html:67-104`
- Modify: `leaderboard.html:80-125`

**Interfaces:**
- Consumes: the 10px floor and ruled detail grammar from Task 1.
- Produces: shared `.page-hero-copy`, `.page-proof`, and `.challenge-state` markup/CSS used unchanged by Task 3.

- [ ] **Step 1: Add failing technical-page structure checks**

Inside `check_technical`, add:

```python
    proof_copy = {
        "startkit.html": ("Python ≥ 3.12", "PyTorch ≥ 2.2", "BIDS-first", "MIT licensed"),
        "faq.html": ("7 rules", "4 optional questions", "Canonical rules source", "Reproducibility audit"),
        "leaderboard.html": ("4 track boards", "Preview", "Begin Sep 16", "Baselines available"),
    }
    for name, parsed in pages.items():
        proofs = parsed.find("aside", "page-proof")
        states = parsed.find("section", "challenge-state")
        if len(proofs) != 1 or not proofs[0]["attrs"].get("aria-label"):
            errors.append(f"{name}: requires one labelled page-proof aside")
        if len(states) != 1 or not states[0]["attrs"].get("aria-label"):
            errors.append(f"{name}: requires one labelled challenge-state section")
        if parsed.find(class_name="announcement-strip"):
            errors.append(f"{name}: legacy announcement strip remains")
        proof_text = element_text(proofs[0]) if proofs else ""
        for fact in proof_copy[name]:
            if fact not in proof_text:
                errors.append(f"{name}: page proof missing {fact!r}")
```

- [ ] **Step 2: Run the technical gate and record RED**

Run:

```bash
python3 scripts/design-check.py --scope technical
```

Expected: FAIL for missing proof/state structures and retained announcement strips on all three routes.

- [ ] **Step 3: Implement the shared hero composition**

On each route, wrap the existing eyebrow, heading, paragraph, and CTA in `<div class="page-hero-copy">`. Add one `<aside class="page-proof">` as the second child of `.page-hero-inner`.

Use this exact start-kit proof:

```html
<aside class="page-proof" aria-label="Start-kit at a glance">
  <div><span>Runtime</span><strong>Python ≥ 3.12</strong></div>
  <div><span>Framework</span><strong>PyTorch ≥ 2.2</strong></div>
  <div><span>Data layout</span><strong>BIDS-first</strong></div>
  <div><span>License</span><strong>MIT licensed</strong></div>
</aside>
```

Use this exact FAQ proof:

```html
<aside class="page-proof" aria-label="Rules at a glance">
  <div><span>Binding</span><strong>7 rules</strong></div>
  <div><span>Optional help</span><strong>4 optional questions</strong></div>
  <div><span>Authority</span><strong>Canonical rules source</strong></div>
  <div><span>Finalists</span><strong>Reproducibility audit</strong></div>
</aside>
```

Use this exact leaderboard proof:

```html
<aside class="page-proof" aria-label="Leaderboard at a glance">
  <div><span>Boards</span><strong>4 track boards</strong></div>
  <div><span>Phase</span><strong>Preview</strong></div>
  <div><span>Updates</span><strong>Begin Sep 16</strong></div>
  <div><span>Reference</span><strong>Baselines available</strong></div>
</aside>
```

- [ ] **Step 4: Replace the announcement with one shared state rail**

Delete each `.announcement-strip`. Insert this structure immediately after the hero and before the existing local navigation:

```html
<section class="challenge-state" aria-label="Competition schedule and state">
  <div><span>State</span><strong>Preview</strong></div>
  <div><span>Submissions</span><strong>Sep 16 - Nov 16, 2026</strong></div>
  <div><span>Handoff</span><strong><a href="https://brainbodyfm-workshop.github.io" target="_blank" rel="noreferrer noopener">NeurIPS 2026 · Sydney</a></strong></div>
</section>
```

Keep each local navigation immediately after this state rail. Do not add new links or change anchor IDs.

- [ ] **Step 5: Add the shared CSS without another override layer**

Replace the current `.page-hero`, `.page-hero-inner`, and old announcement rules in their existing component section with:

```css
.page-hero {
  padding: 64px max(20px, calc((100% - 1344px) / 2)) 56px;
  background: var(--bs-surface);
  border-bottom: 1px solid var(--bs-card-border);
}

.page-hero-inner {
  width: 100%;
  max-width: 1344px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.58fr);
  gap: clamp(48px, 8vw, 128px);
  align-items: end;
}

.page-hero-copy { max-width: 780px; }

.page-proof {
  align-self: stretch;
  display: grid;
  align-content: end;
  border-top: 1px solid var(--bs-text);
}

.page-proof > div {
  display: grid;
  grid-template-columns: minmax(96px, 0.7fr) minmax(0, 1fr);
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--bs-card-border);
}

.page-proof > div:first-child { box-shadow: inset 3px 0 0 var(--bs-violet); padding-left: 12px; }
.page-proof span,
.challenge-state span { font: 700 10px/1.4 var(--bs-fontmono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--bs-violet); }
.page-proof strong,
.challenge-state strong { font-size: 14px; line-height: 1.45; color: var(--bs-text); }

.challenge-state {
  display: grid;
  grid-template-columns: 0.65fr 1.35fr 1fr;
  width: min(100% - 40px, 1344px);
  min-height: 60px;
  margin-inline: auto;
  background: #fff;
  border-bottom: 1px solid var(--bs-card-border);
}

.challenge-state > div { display: grid; align-content: center; gap: 3px; padding: 10px 24px; border-right: 1px solid var(--bs-card-border); }
.challenge-state > div:first-child { padding-left: 0; }
.challenge-state > div:last-child { border-right: 0; }

@media (max-width: 900px) {
  .page-hero-inner { grid-template-columns: 1fr; gap: 36px; align-items: start; }
}

@media (max-width: 640px) {
  .page-hero { padding-top: 40px; padding-bottom: 36px; }
  .page-hero-inner { gap: 28px; }
  .page-proof { grid-template-columns: 1fr 1fr; }
  .page-proof > div { grid-template-columns: 1fr; gap: 2px; min-height: 48px; padding: 8px 10px; }
  .page-proof > div:nth-child(odd) { border-right: 1px solid var(--bs-card-border); }
  .page-proof > div:first-child { padding-left: 10px; }
  .challenge-state { grid-template-columns: 0.7fr 1.3fr; min-height: 0; }
  .challenge-state > div { min-height: 52px; padding: 8px 12px; border-bottom: 1px solid var(--bs-card-border); }
  .challenge-state > div:first-child { padding-left: 0; }
  .challenge-state > div:nth-child(2) { border-right: 0; }
  .challenge-state > div:last-child { grid-column: 1 / -1; border-bottom: 0; }
}
```

- [ ] **Step 6: Verify technical pages**

Run:

```bash
python3 scripts/design-check.py --scope technical
python3 scripts/design-check.py --scope detail
python3 scripts/design-check.py --scope all
python3 scripts/coverage-check.py
git diff --check
```

Expected: all PASS. At 390px, inspect start kit, FAQ, and leaderboard and confirm the hero/state/local-nav stack is at most 640px, state rail is at most 108px, CTAs remain 44px, and the first substantive section begins without horizontal overflow.

- [ ] **Step 7: Commit technical first-fold composition**

```bash
git add scripts/design-check.py assets/css/landing.css startkit.html faq.html leaderboard.html
git commit -m "design: differentiate technical page first folds"
```

---

### Task 3: Narrative-Page Proof Rails and Ethics State Merge

**Files:**
- Modify: `scripts/design-check.py`
- Modify: `assets/css/landing.css:2860-3225`
- Modify: `assets/css/organizers.css` only if `.org-hero-stats` retains a route-specific conflict
- Modify: `awards.html:68-95`
- Modify: `ethics.html:67-101`
- Modify: `organizers.html:68-92`
- Modify: `track-record.html:67-87`

**Interfaces:**
- Consumes: `.page-hero-copy`, `.page-proof`, and `.challenge-state` from Task 2.
- Produces: the same shared first-fold interface on all seven secondary routes; no new component class is introduced.

- [ ] **Step 1: Add failing narrative structure checks**

Inside `check_narrative`, add:

```python
    proof_copy = {
        "awards.html": ("4 tracks", "3 prize places", "$2,500", "Sydney"),
        "ethics.html": ("Preview", "Provider approvals", "Explicit consent", "Read-only decoders"),
        "organizers.html": ("28", "4", "14", "5"),
        "track-record.html": ("2021", "2026", "4 competitions", "Same lead"),
    }
    for name, (_, parsed) in pages.items():
        proofs = parsed.find("aside", "page-proof")
        states = parsed.find("section", "challenge-state")
        if len(proofs) != 1 or not proofs[0]["attrs"].get("aria-label"):
            errors.append(f"{name}: requires one labelled page-proof aside")
        if len(states) != 1 or not states[0]["attrs"].get("aria-label"):
            errors.append(f"{name}: requires one labelled challenge-state section")
        if parsed.find(class_name="announcement-strip"):
            errors.append(f"{name}: legacy announcement strip remains")
        proof_text = element_text(proofs[0]) if proofs else ""
        for fact in proof_copy[name]:
            if fact not in proof_text:
                errors.append(f"{name}: page proof missing {fact!r}")
    if pages["ethics.html"][1].find(class_name="review-state"):
        errors.append("ethics.html: duplicate review-state strip remains")
```

- [ ] **Step 2: Run the narrative gate and record RED**

Run:

```bash
python3 scripts/design-check.py --scope narrative
```

Expected: FAIL for missing proof/state structures, retained announcements, and the duplicate Ethics review strip.

- [ ] **Step 3: Add route-specific proof using existing facts**

Wrap each current hero copy in `.page-hero-copy`, then add these exact proof asides:

```html
<!-- awards.html -->
<aside class="page-proof" aria-label="Awards at a glance">
  <div><span>Tracks</span><strong>4 tracks</strong></div>
  <div><span>Places</span><strong>3 prize places</strong></div>
  <div><span>Cash</span><strong>$2,500 each</strong></div>
  <div><span>Presentation</span><strong>Sydney workshop</strong></div>
</aside>

<!-- ethics.html -->
<aside class="page-proof" aria-label="Ethics review at a glance">
  <div><span>State</span><strong>Preview</strong></div>
  <div><span>Launch gate</span><strong>Provider approvals</strong></div>
  <div><span>Participants</span><strong>Explicit consent</strong></div>
  <div><span>Models</span><strong>Read-only decoders</strong></div>
</aside>

<!-- organizers.html; replace the current org-hero-stats div -->
<aside class="page-proof org-hero-stats" aria-label="Team composition">
  <div><span>Team</span><strong>28 organizers</strong></div>
  <div><span>Scope</span><strong>4 tracks</strong></div>
  <div><span>Network</span><strong>14 institutions</strong></div>
  <div><span>Countries</span><strong>5 countries</strong></div>
</aside>

<!-- track-record.html -->
<aside class="page-proof" aria-label="Competition lineage at a glance">
  <div><span>Lineage</span><strong>2021 → 2026</strong></div>
  <div><span>Record</span><strong>4 competitions</strong></div>
  <div><span>Coordination</span><strong>Same lead</strong></div>
  <div><span>Infrastructure</span><strong>Same open-source platform</strong></div>
</aside>
```

- [ ] **Step 4: Add state rails and merge Ethics review state**

Awards, organizers, and track record use the exact three-field `.challenge-state` markup from Task 2. Ethics deletes `.review-state` and uses:

```html
<section class="challenge-state challenge-state-review" aria-label="Competition schedule and ethics review state">
  <div><span>State</span><strong>Preview</strong></div>
  <div><span>Launch gate</span><strong>Provider approvals pending</strong></div>
  <div><span>Submissions</span><strong>Sep 16 - Nov 16, 2026</strong></div>
  <div><span>Handoff</span><strong><a href="https://brainbodyfm-workshop.github.io" target="_blank" rel="noreferrer noopener">NeurIPS 2026 · Sydney</a></strong></div>
</section>
```

Add only this shared modifier:

```css
.challenge-state-review { grid-template-columns: 0.55fr 1.1fr 1.25fr 1fr; }

@media (max-width: 640px) {
  .challenge-state-review { grid-template-columns: 1fr 1fr; }
  .challenge-state-review > div:last-child { grid-column: auto; }
  .challenge-state-review > div:nth-child(2) { border-right: 0; }
}
```

Place the existing Ethics local navigation after the merged state rail.

- [ ] **Step 5: Remove obsolete narrative-only overrides**

Delete `.review-state` rules. Remove `.narrative-page .page-hero-inner { max-width: 980px; }` and `.awards-hero .page-hero-inner { max-width: 1120px; }` because they conflict with the shared two-column grid. Keep route-specific content widths below the first fold.

If `assets/css/organizers.css` overrides `.org-hero-stats` as a four-column banner, remove only those hero declarations so the shared `.page-proof` rules win. Preserve all directory, portrait, biography, affiliation, and institution-stage rules.

- [ ] **Step 6: Verify narrative pages and all routes**

Run:

```bash
python3 scripts/design-check.py --scope narrative
python3 scripts/design-check.py --scope detail
python3 scripts/design-check.py --scope all
python3 scripts/coverage-check.py
git diff --check
```

Expected: all PASS. At 390px, verify the seven secondary routes each expose page-specific proof, the state rail stays at or below 108px, the pre-content stack stays at or below 640px, and Ethics contains only one state system.

- [ ] **Step 7: Commit narrative first-fold composition**

```bash
git add scripts/design-check.py assets/css/landing.css assets/css/organizers.css awards.html ethics.html organizers.html track-record.html
git commit -m "design: differentiate narrative page first folds"
```

---

### Task 4: Optical Reuse, Navigation Detail, and Ruled Metadata

**Files:**
- Modify: `assets/css/landing.css:72-105, 1360-1395, 2740-2765, 2929-2968, 3295-3320, 3623-3768`
- Modify: `scripts/design-check.py`

**Interfaces:**
- Consumes: the proof/state system from Tasks 2–3 and the existing `.vb-tracks-meta`, `.board-status`, `.local-nav`, `.site-menu`, `.vb-rule`, `.award-track`, and `.year-entry` components.
- Produces: one repeatable violet-registration/hairline grammar without adding markup or artwork.

- [ ] **Step 1: Capture the retained comparison before styling**

Capture top screenshots for all nine routes at 1440×1100 and 390×844 into `/tmp/round-two-before-detail/`. Record these four explicit failure questions in the iteration ledger: competing small soft boxes, missing nav affordance, mismatched metadata row rhythm, and broken first/last separators.

- [ ] **Step 2: Add a static guard for the single gesture family**

Extend `check_detail_css`:

```python
    required_detail_selectors = (
        ".site-menu > a:not(.bs-btn)::after",
        ".local-nav a::after",
        ".page-proof > div:first-child",
        ".vb-tracks-meta > div:first-child",
    )
    for selector in required_detail_selectors:
        if selector not in styles["assets/css/landing.css"]:
            errors.append(f"assets/css/landing.css: missing shared detail selector {selector}")
```

Run `python3 scripts/design-check.py --scope detail` and record RED for the missing selectors.

- [ ] **Step 3: Add the shared navigation underline**

```css
.site-menu > a:not(.bs-btn),
.local-nav a { position: relative; }

.site-menu > a:not(.bs-btn)::after,
.local-nav a::after {
  content: "";
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: -6px;
  height: 1px;
  background: var(--bs-violet);
  transition: left 180ms ease, right 180ms ease;
}

.site-menu > a:not(.bs-btn):is(:hover, :focus-visible, [aria-current])::after,
.local-nav a:is(:hover, :focus-visible, [aria-current])::after {
  left: 0;
  right: 0;
}
```

Do not suppress the existing focus halo. Under reduced motion, the existing global transition rule must make this immediate.

- [ ] **Step 4: Normalize open-paper metadata rows**

Replace the soft-box treatment of `.vb-tracks-meta > div` with:

```css
.vb-tracks-meta > div {
  display: grid;
  gap: 4px;
  padding: 11px 0;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--bs-card-border);
  border-radius: 0;
}

.vb-tracks-meta > div:first-child {
  padding-left: 12px;
  border-top: 1px solid var(--bs-text);
  box-shadow: inset 3px 0 0 var(--bs-violet);
}
```

Apply the same separator rhythm to `.board-status > div`; retain its grid columns and native table semantics. Do not convert code, tables, rules caveats, sponsor marks, or primary actions to open paper.

- [ ] **Step 5: Check optical alignment on the four strongest route grammars**

At 1440px and 390px, inspect:

- homepage track labels and proof strip;
- awards declaration and per-track rows;
- FAQ rule numerals and content starts;
- track-record year rail and evidence headers.

Use CSS-only optical adjustments in multiples of 4px, except a 1px rule or a maximum 2px optical correction. Do not add a new component, illustration, badge family, shadow family, or radius.

- [ ] **Step 6: Verify and commit detail reuse**

Run:

```bash
python3 scripts/design-check.py --scope detail
python3 scripts/design-check.py --scope all
python3 scripts/coverage-check.py
node --check assets/js/ui.js
git diff --check
```

Expected: all PASS.

```bash
git add assets/css/landing.css scripts/design-check.py
git commit -m "design: unify ruled details and navigation cues"
```

---

### Task 5: Dependency-Free Visual Gate and Ten-Pass Adversarial QA

**Files:**
- Create: `scripts/visual-detail-check.mjs`
- Create: `.superpowers/sdd/2026-08-31-round-two/iterations.md`
- Modify only when a failing pass proves a defect: the smallest relevant HTML/CSS/JS file

**Interfaces:**
- Consumes: `CDP_PORT` with a running local Chrome debugging endpoint and `BASE_URL` defaulting to `http://127.0.0.1:4173`.
- Produces: exit 0 only when all route/viewport geometry and typography checks pass, plus deterministic screenshots under `OUTPUT_DIR`.

- [ ] **Step 1: Write the failing visual checker invocation**

Run before creating the script:

```bash
CDP_PORT=9226 BASE_URL=http://127.0.0.1:4173 OUTPUT_DIR=/tmp/round-two-final node scripts/visual-detail-check.mjs
```

Expected: FAIL because `scripts/visual-detail-check.mjs` does not exist.

- [ ] **Step 2: Implement the native CDP checker**

Create `scripts/visual-detail-check.mjs` with these exact constants and assertions:

```javascript
import { mkdir, writeFile } from 'node:fs/promises';

const port = Number(process.env.CDP_PORT || 9226);
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const output = process.env.OUTPUT_DIR || '/tmp/round-two-final';
const routes = ['index.html', 'awards.html', 'ethics.html', 'faq.html', 'leaderboard.html', 'organizers.html', 'startkit.html', 'track-record.html', '404.html'];
const secondary = new Set(routes.slice(1, -1));
const sizes = [[1440, 1100], [834, 1080], [390, 844], [320, 720]];

class Cdp {
  constructor(target, socket) {
    this.target = target;
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    this.errors = [];
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        return message.error ? pending.reject(new Error(JSON.stringify(message.error))) : pending.resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown' || (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error')) this.errors.push(message);
      for (const resolve of this.events.get(message.method) || []) resolve(message.params);
      this.events.delete(message.method);
    };
  }
  call(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  once(method) {
    return new Promise(resolve => this.events.set(method, [...(this.events.get(method) || []), resolve]));
  }
  async eval(expression) {
    const result = await this.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async close() {
    this.socket.close();
    await fetch(`http://127.0.0.1:${port}/json/close/${this.target.id}`);
  }
}

async function open(route, width, height) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about%3Ablank`, { method: 'PUT' })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const page = new Cdp(target, socket);
  await Promise.all(['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable'].map(method => page.call(method)));
  await page.call('Network.setCacheDisabled', { cacheDisabled: true });
  await page.call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  const loaded = page.once('Page.loadEventFired');
  await page.call('Page.navigate', { url: `${base}/${route}` });
  await loaded;
  await page.eval(`(async()=>{if(document.fonts)await document.fonts.ready;scrollTo(0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return true})()`);
  return page;
}

await mkdir(output, { recursive: true });
for (const route of routes) {
  for (const [width, height] of sizes) {
    const page = await open(route, width, height);
    const state = await page.eval(`(()=>{
      const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
      const rect=e=>e?(()=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}})():null;
      const small=[...document.querySelectorAll('body *')].filter(e=>visible(e)&&e.childElementCount===0&&e.textContent.trim()&&!e.closest('pre,code')).map(e=>({tag:e.tagName,className:e.className,text:e.textContent.trim().slice(0,40),size:parseFloat(getComputedStyle(e).fontSize)})).filter(e=>e.size<10);
      const buttons=[...document.querySelectorAll('button,.bs-btn')].filter(visible).map(rect).filter(r=>r.width<44||r.height<44);
      const hero=document.querySelector('.page-hero');
      const proof=document.querySelector('.page-proof');
      const challenge=document.querySelector('.challenge-state');
      const local=document.querySelector('.local-nav');
      const stack=hero?Math.max(hero.getBoundingClientRect().bottom,challenge?.getBoundingClientRect().bottom||0,local?.getBoundingClientRect().bottom||0)-hero.getBoundingClientRect().top:0;
      return {innerWidth,clientWidth:document.documentElement.clientWidth,rootWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,small,buttons,hero:rect(hero),proof:rect(proof),challenge:rect(challenge),stack};
    })()`);
    if (state.innerWidth !== width || state.clientWidth !== width || state.rootWidth !== width || state.bodyWidth !== width) throw new Error(`overflow ${route} ${width}: ${JSON.stringify(state)}`);
    if (state.small.length) throw new Error(`microtype ${route} ${width}: ${JSON.stringify(state.small)}`);
    if (state.buttons.length) throw new Error(`targets ${route} ${width}: ${JSON.stringify(state.buttons)}`);
    if (secondary.has(route) && (!state.proof || !state.challenge)) throw new Error(`first-fold components ${route} ${width}`);
    if (secondary.has(route) && width <= 390 && state.stack > 640) throw new Error(`first-fold stack ${route} ${width}: ${state.stack}`);
    if (secondary.has(route) && width <= 390 && state.challenge.height > 108) throw new Error(`state height ${route} ${width}: ${state.challenge.height}`);
    if (page.errors.length) throw new Error(`console ${route} ${width}: ${JSON.stringify(page.errors)}`);
    const shot = await page.call('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    await writeFile(`${output}/${route.replace('.html','')}-${width}x${height}.png`, Buffer.from(shot.data, 'base64'));
    await page.close();
  }
}
console.log(`PASS: ${routes.length * sizes.length} visual detail captures`);
```

- [ ] **Step 3: Launch a dedicated Chrome endpoint and run GREEN**

Run Chrome in a dedicated terminal/session:

```bash
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless=new \
  --remote-debugging-port=9226 \
  --user-data-dir=/tmp/round-two-cdp-profile \
  --disable-gpu \
  about:blank
```

Then run:

```bash
CDP_PORT=9226 BASE_URL=http://127.0.0.1:4173 OUTPUT_DIR=/tmp/round-two-final node scripts/visual-detail-check.mjs
```

Expected: `PASS: 36 visual detail captures`.

- [ ] **Step 4: Execute and record the ten visual critique passes**

Create `.superpowers/sdd/2026-08-31-round-two/iterations.md` with one row for each spec question: entry point, eye flow, weight, grid, cadence, reuse, density, responsive composition, resilience, and originality/performance. Each row records desktop/mobile evidence filenames, finding, change or `no change`, and PASS/FAIL. Use the installed `design-critique` and `critique-visual-hierarchy` skills for passes 1–6 and the existing accessibility/performance/visual-verdict skills for passes 7–10.

Any FAIL receives the smallest CSS/HTML correction at the shared root, a rerun of the affected capture, and a fresh row noting the correction. Do not add artwork, JavaScript behavior, component classes, or dependencies to resolve a spacing/alignment defect.

- [ ] **Step 5: Run adversarial resilience checks**

Verify all nine routes with JavaScript disabled, reduced motion, and normal JavaScript. On the homepage additionally disable `IntersectionObserver`, then scroll through every lazy stage. Required evidence:

- exactly one visible track image per track in no-JS mode;
- all four deferred figures and all sponsor images become complete with nonzero `naturalWidth` after scroll;
- MathJax renders the leaderboard formulas with normal JavaScript and with missing `IntersectionObserver`;
- the mobile menu opens, closes with Escape, returns focus, and fits inside `100dvh`;
- every table/code region is keyboard-scrollable and the document itself remains contained;
- no console errors in any mode.

- [ ] **Step 6: Run full static and HTTP verification**

```bash
python3 scripts/design-check.py --scope all
python3 scripts/coverage-check.py
node --check assets/js/ui.js
node --check scripts/visual-detail-check.mjs
PYTHONPYCACHEPREFIX=/tmp/round-two-pycache python3 -m py_compile scripts/design-check.py scripts/coverage-check.py
git diff --check
for page in index awards ethics faq leaderboard organizers startkit track-record 404; do curl -fsS -o /dev/null "http://127.0.0.1:4173/${page}.html"; done
rg -n 'assets/js/ui\.js\?v=' -- *.html
```

Expected: all commands pass; all nine HTML files contain exactly the same current `ui.js` cache key.

- [ ] **Step 7: Rerun Lighthouse three times per measured route**

Run three mobile Lighthouse passes for `/index.html` and `/leaderboard.html`, retaining raw JSON under `/tmp/round-two-lighthouse/`. Report median and range; do not discard a slow run.

Required medians: homepage Performance ≥90; leaderboard Performance ≥85; Accessibility, Best Practices, and SEO ≥95 on both routes. Preserve the initial homepage transfer budget and deferred below-fold requests.

- [ ] **Step 8: Commit the visual gate and any proven final corrections**

```bash
git add scripts/visual-detail-check.mjs assets/css assets/js *.html
git commit -m "test: lock round two visual detail quality"
```

Do not add unchanged files. Keep raw screenshots, Lighthouse JSON, and the iteration ledger out of the production commit unless the repository's existing ignore policy explicitly tracks them.

- [ ] **Step 9: Request fresh task and whole-branch reviews**

Give a fresh reviewer the Round Two spec, this plan, baseline `6b7555e`, final head, screenshot matrix, ten-pass ledger, raw Lighthouse JSON, and static-gate output. Require Critical/Important/Minor findings and an explicit approval verdict. Corrections return to the original task implementer; every correction receives a fresh re-review.

- [ ] **Step 10: Final completion proof**

From the approved final head, rerun Step 6 and `scripts/visual-detail-check.mjs`, confirm a clean worktree, confirm `http://127.0.0.1:4173/` is healthy, and record the final commit. Do not publish, merge, or push without a separate user instruction.

---

## Plan Self-Review

- **Spec coverage:** Tasks 1–4 cover trophy scarcity, proof/state first folds, 10px microtype, rule reuse, CSS cleanup, navigation detail, and route differentiation. Task 5 covers all ten iteration questions, resilience, performance, accessibility, and fresh review.
- **Placeholder scan:** The plan contains no deferred implementation markers or unspecified error-handling steps. Every structural change includes exact markup, CSS, gate code, commands, and expected results.
- **Interface consistency:** `.page-hero-copy`, `.page-proof`, and `.challenge-state` are defined once in Task 2 and consumed unchanged in Task 3. `check_detail_css` is defined in Task 1 and extended—not duplicated—in Task 4. The CDP script's environment variables and screenshot output are consistent across Steps 1–3.
- **Scope discipline:** No new artwork, product feature, authentication, framework, analytics, CMS, or content claim is introduced. The plan changes only the detail system and its QA evidence.
