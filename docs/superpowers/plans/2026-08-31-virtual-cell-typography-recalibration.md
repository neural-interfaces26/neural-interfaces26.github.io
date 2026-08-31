# Virtual Cell Typography Recalibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recalibrate typography and spacing across all nine EEG/EMG Foundation Challenge routes to match the Virtual Cell Challenge's restrained editorial hierarchy while preserving the approved trophy identity and every accessibility, content, and performance contract.

**Architecture:** Add a small shared typography scale to the existing design tokens, route all common body, action, hero, lead, and section styles through those tokens, and keep oversized data numerals as documented exceptions. Extend the existing standard-library design checker and dependency-free CDP visual checker so both source declarations and computed browser styles are verified across the full route and viewport matrix.

**Tech Stack:** Static HTML, native CSS custom properties, Python 3 standard library, Node.js standard library, Chrome DevTools Protocol, Git.

**Spec:** `docs/superpowers/specs/2026-08-31-virtual-cell-typography-recalibration.md`

## Global Constraints

- Preserve all nine routes: `index.html`, `awards.html`, `ethics.html`, `faq.html`, `leaderboard.html`, `organizers.html`, `startkit.html`, `track-record.html`, and `404.html`.
- Preserve Noto Sans, IBM Plex Mono, the exact violet palette, trophy artwork, trophy seal, scientific figures, facts, navigation, anchor IDs, metadata, and accessible names.
- Do not add a font, image, runtime dependency, framework, build step, route, or JavaScript interaction.
- Body text computes to exactly 16px / 24px on every route.
- Navigation and button text compute to exactly 16px with a 24px line box.
- Homepage H1 computes between 42px and 64px; secondary-page H1 computes between 40px and 56px.
- Hero and introductory leads compute between 18px and 20px with 1.6 line-height.
- Section H2 text computes between 32px and 48px with weight 700.
- Preserve 44×44px minimum targets and 48px hero-button height.
- Preserve the initial-view CTA, two-line desktop homepage H1, 320px font-fallback containment, reduced motion, no-JS visibility, and missing-IntersectionObserver behavior.
- Keep the current 1344px content maximum and hero trophy composition.
- Do not alter intentional large data typography: prize totals, award totals, countdowns, metrics, track numbers, rule numbers, years, or technical table identifiers.
- Use `apply_patch` for repository edits.
- Use a fresh commit after each task passes its local and aggregate checks.

---

## File Structure

- `docs/superpowers/specs/2026-08-31-virtual-cell-typography-recalibration.md` — approved visual and acceptance contract.
- `DESIGN.md` — concise durable project-level typography contract for later contributors.
- `assets/css/tokens.css` — shared typography values; no component styling.
- `assets/css/base.css` — global body, button, and reusable action typography.
- `assets/css/landing.css` — shared shell, homepage, technical-page, narrative-page, and recovery-page typography and spacing.
- `assets/css/organizers.css` — organizer-only section override removal and directory rhythm.
- `scripts/design-check.py` — static typography-contract regression checks.
- `scripts/visual-detail-check.mjs` — computed-style and responsive screenshot regression checks.

HTML files are deliberately excluded. The shortest correct implementation changes shared CSS once instead of editing nine repeated page shells.

## Skill Routing

- Planning: `superpowers:writing-plans`.
- Implementation discipline: `superpowers:test-driven-development`.
- Design direction: `design-taste-frontend` and `frontend-design`.
- Execution: `superpowers:subagent-driven-development`.
- Per-task review: `frontend-design-review` and `superpowers:requesting-code-review`.
- Hierarchy comparison: `critique-visual-hierarchy` and `design-critique`.
- Screenshot verdict: `visual-verdict` and `visual-testing-advanced`.
- Accessibility: `accessibility` and `accessibility-patterns`.
- Browser inspection: `chrome-devtools` or `browser-automation`.
- Final cleanup: `ai-slop-cleaner`.
- Completion evidence: `superpowers:verification-before-completion`.

---

### Task 1: Shared Typography Foundation

**Files:**
- Modify: `scripts/design-check.py:113-175,795-814`
- Modify: `assets/css/tokens.css:1-24`
- Modify: `assets/css/base.css:20-29,164-208`
- Modify: `assets/css/landing.css:22-125,3153-3164`
- Modify: `DESIGN.md`

**Interfaces:**
- Consumes: the exact scale in the specification's **Typography Contract**.
- Produces: CSS custom properties `--bs-type-body`, `--bs-leading-body`, `--bs-type-action`, `--bs-leading-action`, `--bs-type-lead`, `--bs-leading-lead`, `--bs-type-hero-home`, `--bs-type-hero-page`, `--bs-type-section`, `--bs-weight-display`, and `--bs-tracking-display`; `python3 scripts/design-check.py --scope typography`.

- [ ] **Step 1: Add the failing static typography scope**

Add this function after `check_tokens` in `scripts/design-check.py`:

```python
def check_typography(errors: list[str]) -> None:
    styles = {
        name: strip_css_comments((ROOT / name).read_text(encoding="utf-8"))
        for name in (
            "assets/css/tokens.css",
            "assets/css/base.css",
            "assets/css/landing.css",
            "assets/css/organizers.css",
        )
    }
    rules = (
        ("assets/css/tokens.css", "body token", r"--bs-type-body\s*:\s*16px\s*;"),
        ("assets/css/tokens.css", "body leading", r"--bs-leading-body\s*:\s*1\.5\s*;"),
        ("assets/css/tokens.css", "action token", r"--bs-type-action\s*:\s*16px\s*;"),
        ("assets/css/tokens.css", "action leading", r"--bs-leading-action\s*:\s*1\.5\s*;"),
        ("assets/css/tokens.css", "lead token", r"--bs-type-lead\s*:\s*clamp\(18px,\s*1\.55vw,\s*20px\)\s*;"),
        ("assets/css/tokens.css", "lead leading", r"--bs-leading-lead\s*:\s*1\.6\s*;"),
        ("assets/css/tokens.css", "home hero token", r"--bs-type-hero-home\s*:\s*clamp\(42px,\s*4\.5vw,\s*64px\)\s*;"),
        ("assets/css/tokens.css", "page hero token", r"--bs-type-hero-page\s*:\s*clamp\(40px,\s*4vw,\s*56px\)\s*;"),
        ("assets/css/tokens.css", "section token", r"--bs-type-section\s*:\s*clamp\(32px,\s*3\.4vw,\s*48px\)\s*;"),
        ("assets/css/tokens.css", "display weight", r"--bs-weight-display\s*:\s*700\s*;"),
        ("assets/css/tokens.css", "display tracking", r"--bs-tracking-display\s*:\s*-0\.025em\s*;"),
        ("assets/css/base.css", "body scale", r"body\s*\{[^}]*font-size\s*:\s*var\(--bs-type-body\)[^}]*line-height\s*:\s*var\(--bs-leading-body\)"),
        ("assets/css/base.css", "button scale", r"\.bs-btn\s*\{[^}]*font-size\s*:\s*var\(--bs-type-action\)[^}]*line-height\s*:\s*var\(--bs-leading-action\)"),
        ("assets/css/landing.css", "brand scale", r"\.site-brand\s*\{[^}]*font-size\s*:\s*16px"),
        ("assets/css/landing.css", "primary navigation scale", r"\.site-menu\s*>\s*a:not\(\.bs-btn\)\s*\{[^}]*font-size\s*:\s*16px"),
        ("assets/css/landing.css", "local navigation scale", r"\.local-nav a\s*\{[^}]*font-size\s*:\s*16px"),
    )
    for path, label, pattern in rules:
        if not re.search(pattern, styles[path], flags=re.DOTALL):
            errors.append(f"{path}: missing typography contract: {label}")
```

Add `"typography"` to the `--scope` choices immediately after `"tokens"`, and add `"typography": check_typography` immediately after the `tokens` entry in `checks`.

- [ ] **Step 2: Run the new scope and verify red**

Run:

```bash
python3 scripts/design-check.py --scope typography
```

Expected: exit 1 with failures for the missing typography tokens and the existing 15px body, 13.5px button, and 14px navigation declarations.

- [ ] **Step 3: Add the shared scale to `assets/css/tokens.css`**

Insert after `--bs-fontmono`:

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

- [ ] **Step 4: Recalibrate the body and actions in `assets/css/base.css`**

Replace the body size and leading with:

```css
  font-size: var(--bs-type-body);
  line-height: var(--bs-leading-body);
```

In `.bs-btn`, replace the radius, size, and tracking declarations with:

```css
  border-radius: var(--bs-radius-sm);
  font-weight: 700;
  font-size: var(--bs-type-action);
  line-height: var(--bs-leading-action);
  letter-spacing: 0;
```

Set resting button shadows to none while preserving the existing hover lift:

```css
.bs-btn.primary {
  background: var(--bs-violet);
  color: white;
  box-shadow: none;
}

.bs-btn.ghost {
  background: #ffffff;
  color: var(--bs-text);
  border-color: var(--bs-card-border);
  box-shadow: none;
}
```

Keep `.bs-btn.sm` at 12px because it is compact functional metadata, not a primary action.

- [ ] **Step 5: Recalibrate the shared shell in `assets/css/landing.css`**

Set `.site-brand` to 16px. Set `.site-menu > a:not(.bs-btn)`, `.site-menu > .bs-btn`, and `.local-nav a` to 16px. Preserve their current weights, single-line behavior, and minimum heights.

The changed declarations must be:

```css
.site-brand {
  /* retain existing layout declarations */
  font-size: 16px;
}

.site-menu > a:not(.bs-btn) {
  /* retain existing layout declarations */
  font-size: 16px;
}

.site-menu > .bs-btn { min-height: 44px; font-size: var(--bs-type-action); }

.local-nav a {
  /* retain existing layout declarations */
  font-size: 16px;
}
```

- [ ] **Step 6: Record the durable scale in `DESIGN.md`**

Add this table to the typography section:

```markdown
| Role | Fluid scale | Weight | Leading |
| --- | --- | --- | --- |
| Body | 16px | 400–600 | 1.5 |
| Action and navigation | 16px | 600–700 | 1.5 |
| Lead | 18–20px | 400 | 1.6 |
| Homepage hero | 42–64px | 800 | 1.02 |
| Secondary hero | 40–56px | 700 | 1.08 |
| Section heading | 32–48px | 700 | 1.1 |
```

State immediately below it: `Weight 900 is reserved for intentional numeric display figures, never semantic H1/H2 headings.`

- [ ] **Step 7: Verify the foundation**

Run:

```bash
python3 scripts/design-check.py --scope typography
python3 scripts/design-check.py --scope all
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 8: Commit the foundation**

```bash
git add DESIGN.md assets/css/tokens.css assets/css/base.css assets/css/landing.css scripts/design-check.py
git commit -m "design: establish editorial typography scale"
```

---

### Task 2: Homepage Hierarchy and Cadence

**Files:**
- Modify: `scripts/design-check.py:check_typography`
- Modify: `assets/css/landing.css:361-548,628-653,986-1075`

**Interfaces:**
- Consumes: the Task 1 typography custom properties.
- Produces: token-driven homepage hero, lead, H2, track-heading, and campaign-section styles with no desktop H1 override above the token maximum.

- [ ] **Step 1: Extend the typography checker with failing homepage assertions**

Append these tuples to `rules` inside `check_typography`:

```python
        ("assets/css/landing.css", "homepage hero scale", r"\.campaign-hero-copy h1\s*\{[^}]*font-size\s*:\s*var\(--bs-type-hero-home\)[^}]*font-weight\s*:\s*800[^}]*letter-spacing\s*:\s*var\(--bs-tracking-display\)[^}]*line-height\s*:\s*1\.02"),
        ("assets/css/landing.css", "homepage lead scale", r"\.campaign-hero-copy\s*>\s*p:not\(\.bs-eyebrow\)\s*\{[^}]*font-size\s*:\s*var\(--bs-type-lead\)[^}]*line-height\s*:\s*var\(--bs-leading-lead\)"),
        ("assets/css/landing.css", "campaign section cadence", r"\.campaign-section\s*\{[^}]*padding\s*:\s*96px 48px"),
        ("assets/css/landing.css", "campaign heading scale", r"\.campaign-section-head h2[^{]*\{[^}]*font-size\s*:\s*var\(--bs-type-section\)[^}]*font-weight\s*:\s*var\(--bs-weight-display\)[^}]*line-height\s*:\s*1\.1"),
        ("assets/css/landing.css", "track heading scale", r"\.track-card h3\s*\{[^}]*font-size\s*:\s*clamp\(24px,\s*2vw,\s*30px\)[^}]*font-weight\s*:\s*700[^}]*line-height\s*:\s*1\.2"),
```

Add an explicit prohibition after the `rules` loop:

```python
    landing = styles["assets/css/landing.css"]
    if re.search(r"\.campaign-hero-copy h1\s*\{\s*font-size\s*:\s*80px", landing):
        errors.append("assets/css/landing.css: desktop 80px homepage hero override remains")
```

- [ ] **Step 2: Run the typography scope and verify the homepage assertions fail**

```bash
python3 scripts/design-check.py --scope typography
```

Expected: exit 1 naming homepage hero, lead, section cadence, section heading, track heading, and the 80px override.

- [ ] **Step 3: Recalibrate the homepage hero**

Replace the display declarations in `.campaign-hero-copy h1` with:

```css
  font-size: var(--bs-type-hero-home);
  font-weight: 800;
  letter-spacing: var(--bs-tracking-display);
  line-height: 1.02;
```

Delete only the H1 font-size declarations from the 1200px and 901–1199px media queries. Preserve the trophy transform declarations in both queries.

Replace the typography in `.campaign-hero-copy > p:not(.bs-eyebrow)` with:

```css
  font-size: var(--bs-type-lead);
  line-height: var(--bs-leading-lead);
```

In the max-767px H1 block, delete the local `font-size` and `line-height` declarations so the shared fluid hero token remains authoritative. Preserve the mobile wrapping and margins.

- [ ] **Step 4: Recalibrate homepage section hierarchy**

Set the desktop campaign section to:

```css
.campaign-section {
  padding: 96px 48px;
  border-bottom: 1px solid var(--bs-card-border);
  background: var(--bs-bg);
}
```

In the shared campaign H2 block, use:

```css
  font-size: var(--bs-type-section);
  font-weight: var(--bs-weight-display);
  letter-spacing: -0.02em;
  line-height: 1.1;
```

Set `.campaign-section-head` bottom margin to 48px. Change `.campaign-section-head > p:not(.bs-eyebrow)` and `.challenge-thesis-copy p` to 16px / 1.5. They are section body copy; the 18–20px lead scale remains exclusive to first-fold introductions.

- [ ] **Step 5: Recalibrate track headings without shrinking the figures**

Replace the typography in `.track-card h3` with:

```css
  font-size: clamp(24px, 2vw, 30px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
```

Set `.track-card > p:not(.track-facts)` to 16px / 1.5. Do not edit `.track-card > img`, `srcset`, sizes, or grid-span declarations.

- [ ] **Step 6: Normalize mobile campaign spacing**

In the max-767px media query, set:

```css
  .campaign-section { padding: 64px 24px; }
  .campaign-section-head { grid-template-columns: 1fr; margin-bottom: 36px; }
```

Keep the max-900px 80px/32px intermediate spacing for tablet widths. The max-767px rule must override it.

- [ ] **Step 7: Verify homepage source contracts**

```bash
python3 scripts/design-check.py --scope typography
python3 scripts/design-check.py --scope home
python3 scripts/design-check.py --scope detail
python3 scripts/design-check.py --scope all
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 8: Commit the homepage calibration**

```bash
git add assets/css/landing.css scripts/design-check.py
git commit -m "design: calm homepage type hierarchy"
```

---

### Task 3: Secondary-Page Typography System

**Files:**
- Modify: `scripts/design-check.py:check_typography`
- Modify: `assets/css/landing.css:2402-2465,2694-2702,2816,2920,2958-2968,3044-3230,3447-3486`
- Modify: `assets/css/organizers.css:5-32,180-183`

**Interfaces:**
- Consumes: Task 1 tokens and Task 2 homepage hierarchy.
- Produces: one secondary-page hero/lead/H2/body system shared by technical, narrative, organizer, track-record, and recovery routes.

- [ ] **Step 1: Add failing secondary-page assertions**

Append these tuples to `rules` in `check_typography`:

```python
        ("assets/css/landing.css", "secondary hero scale", r"\.page-hero h1\s*\{[^}]*font-size\s*:\s*var\(--bs-type-hero-page\)[^}]*font-weight\s*:\s*var\(--bs-weight-display\)[^}]*line-height\s*:\s*1\.08"),
        ("assets/css/landing.css", "secondary lead scale", r"\.page-hero p\s*\{[^}]*font-size\s*:\s*var\(--bs-type-lead\)[^}]*line-height\s*:\s*var\(--bs-leading-lead\)"),
        ("assets/css/landing.css", "shared page heading weight", r"\.vb-hero-text h1,[^{]*\.formal-block h3\s*\{[^}]*font-weight\s*:\s*var\(--bs-weight-display\)"),
        ("assets/css/landing.css", "technical section scale", r"\.technical-page \.vb-section-head h2\s*\{[^}]*font-size\s*:\s*var\(--bs-type-section\)[^}]*line-height\s*:\s*1\.1"),
        ("assets/css/landing.css", "recovery heading scale", r"\.error-page h1\s*\{[^}]*font-size\s*:\s*var\(--bs-type-hero-page\)[^}]*font-weight\s*:\s*var\(--bs-weight-display\)"),
        ("assets/css/organizers.css", "organizer section scale", r"\.org-section-head h2\s*\{[^}]*font-size\s*:\s*var\(--bs-type-section\)[^}]*font-weight\s*:\s*var\(--bs-weight-display\)[^}]*line-height\s*:\s*1\.1"),
```

Add this semantic-heading prohibition:

```python
    for path in ("assets/css/landing.css", "assets/css/organizers.css"):
        if re.search(r"(?:h1|h2)[^{]*\{[^}]*font-weight\s*:\s*900", styles[path], flags=re.DOTALL):
            errors.append(f"{path}: semantic H1/H2 still uses weight 900")
```

This pattern intentionally does not match `.award-total`, countdowns, track numbers, rule numbers, or table identifiers because they are not H1/H2 selectors.

- [ ] **Step 2: Run the typography scope and verify red**

```bash
python3 scripts/design-check.py --scope typography
```

Expected: exit 1 naming secondary hero, lead, shared heading weight, technical sections, recovery heading, organizer heading, and remaining semantic 900-weight headings.

- [ ] **Step 3: Recalibrate shared secondary heroes**

Replace `.page-hero h1` display declarations with:

```css
  font-size: var(--bs-type-hero-page);
  font-weight: var(--bs-weight-display);
  letter-spacing: var(--bs-tracking-display);
  line-height: 1.08;
```

Replace `.page-hero p` size and leading with:

```css
  font-size: var(--bs-type-lead);
  line-height: var(--bs-leading-lead);
```

Replace the max-640px technical/narrative H1 override with:

```css
  .technical-page .page-hero h1,
  .narrative-page .page-hero h1 {
    margin: 16px 0 12px;
    font-size: var(--bs-type-hero-page);
    line-height: 1.08;
  }
```

Delete the separate 38px narrative H1 override. Set the mobile page-hero paragraph to `font-size: 18px; line-height: 1.55;` so the first-fold state/proof stack remains within its existing 640px bound.

- [ ] **Step 4: Recalibrate semantic section and card headings**

In the shared display-type group, change weight and tracking to:

```css
  font-weight: var(--bs-weight-display);
  letter-spacing: -0.02em;
```

Delete the component-level `font-weight: 900` declarations from `.vb-hero-text h1`, `.org-hero h1`, and `.vb-cta h2`; the shared display group now supplies weight 700. The homepage campaign H1 remains the sole semantic-heading exception at weight 800 through its separate Task 2 selector.

Change `.vb-section-head h2, .org-section-head h2` to:

```css
  font-size: var(--bs-type-section);
  line-height: 1.1;
  letter-spacing: -0.02em;
```

Use this restrained feature scale:

```css
.vb-track h3 { font-size: 22px; line-height: 1.35; }
.phase-card h3 { font-size: 20px; line-height: 1.4; font-weight: 600; }
.model-card h4,
.formal-block h3 { font-size: 20px; line-height: 1.4; font-weight: 600; }
```

Set `.vb-section-head p.vb-section-subtitle` to 20px / 1.5 and weight 600.

- [ ] **Step 5: Align technical, narrative, history, and recovery headings**

Make each of these component overrides use the shared token and 1.1 line-height:

```css
.technical-page .vb-section-head h2,
.ethics-page .vb-section-head h2,
.track-record-page .year-entry .vb-section-head h2 {
  font-size: var(--bs-type-section);
  line-height: 1.1;
}
```

Update `.error-page h1` to:

```css
  font-size: var(--bs-type-hero-page);
  font-weight: var(--bs-weight-display);
  letter-spacing: var(--bs-tracking-display);
  line-height: 1.08;
```

Update `.error-page .error-copy > p:not(.bs-eyebrow)` to use `var(--bs-type-lead)` and `var(--bs-leading-lead)`.

Do not edit `.award-total`, `.evidence-header time`, `.vb-rule-num`, or `.track-contract tbody th span`.

- [ ] **Step 6: Align organizer typography and spacing**

In `assets/css/organizers.css`, replace `.org-section-head h2` typography with:

```css
  font-size: var(--bs-type-section);
  font-weight: var(--bs-weight-display);
  letter-spacing: -0.02em;
  line-height: 1.1;
```

Set `.org-section` desktop block padding to 80px and mobile block padding to 64px. Delete the max-640px fixed `font-size: 36px` organizer heading override so the shared fluid token controls it.

- [ ] **Step 7: Normalize secondary section rhythm**

Set `.technical-page .vb-section` to 80px block padding. Retain the existing mobile 56px block padding because it protects the technical first fold. Keep narrative prose at 16px / 1.5 and organizer prose at 16px / 1.5.

No HTML, content, table, code, MathJax, portrait, or image-source change is allowed in this task.

- [ ] **Step 8: Verify every page family**

```bash
python3 scripts/design-check.py --scope typography
python3 scripts/design-check.py --scope technical
python3 scripts/design-check.py --scope narrative
python3 scripts/design-check.py --scope detail
python3 scripts/design-check.py --scope all
node --check assets/js/ui.js
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 9: Commit the secondary-page calibration**

```bash
git add assets/css/landing.css assets/css/organizers.css scripts/design-check.py
git commit -m "design: unify editorial page typography"
```

---

### Task 4: Computed-Style and Visual Regression Gate

**Files:**
- Modify: `scripts/visual-detail-check.mjs:77-114,167-224`

**Interfaces:**
- Consumes: the computed styles produced by Tasks 1–3.
- Produces: `state.typography` per capture and browser assertions for body, shell, hero, lead, section, action, and line-count contracts at 1440, 834, 390, and 320px.

- [ ] **Step 1: Extend the browser measurement model**

Replace the `type` helper with:

```javascript
  const type=e=>e?(()=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {size:parseFloat(s.fontSize),lineHeight:parseFloat(s.lineHeight),weight:Number(s.fontWeight),tracking:s.letterSpacing,family:s.fontFamily,lines:Math.round(r.height/parseFloat(s.lineHeight))}})():null;
```

Before the returned object inside `measure`, add:

```javascript
  const typography={
    body:type(document.body),
    brand:type(document.querySelector('.site-brand')),
    nav:type(document.querySelector('.site-menu > a:not(.bs-btn), .site-menu > .bs-btn')),
    localNav:type(document.querySelector('.local-nav a')),
    button:type(document.querySelector('.bs-btn')),
    homeHero:type(document.querySelector('.campaign-hero-copy h1')),
    pageHero:type(document.querySelector('.page-hero h1, .error-page h1')),
    lead:type(document.querySelector('.campaign-hero-copy > p:not(.bs-eyebrow), .page-hero p, .error-copy > p:not(.bs-eyebrow)')),
    section:type(document.querySelector('.campaign-section-head h2, .vb-section-head h2, .org-section-head h2')),
  };
```

Add `typography` to the returned state object.

- [ ] **Step 2: Add failing computed-style assertions**

Append to `assertState` after the target-size assertion:

```javascript
  const t=state.typography;
  if (t.body.size!==16||t.body.lineHeight!==24) throw new Error(`body typography ${route} ${width}: ${JSON.stringify(t.body)}`);
  if (t.brand.size!==16) throw new Error(`brand typography ${route} ${width}: ${JSON.stringify(t.brand)}`);
  if (width>900&&t.nav?.size!==16) throw new Error(`navigation typography ${route} ${width}: ${JSON.stringify(t.nav)}`);
  if (t.localNav&&t.localNav.size!==16) throw new Error(`local navigation typography ${route} ${width}: ${JSON.stringify(t.localNav)}`);
  if (t.button&&t.button.size!==16) throw new Error(`button typography ${route} ${width}: ${JSON.stringify(t.button)}`);
  if (t.homeHero&&(t.homeHero.size<42||t.homeHero.size>64||t.homeHero.weight!==800||(width>900&&t.homeHero.lines>2))) throw new Error(`homepage hero typography ${route} ${width}: ${JSON.stringify(t.homeHero)}`);
  if (t.pageHero&&(t.pageHero.size<40||t.pageHero.size>56||t.pageHero.weight!==700)) throw new Error(`page hero typography ${route} ${width}: ${JSON.stringify(t.pageHero)}`);
  if (t.lead&&(t.lead.size<18||t.lead.size>20||Math.abs(t.lead.lineHeight/t.lead.size-1.6)>.06)) throw new Error(`lead typography ${route} ${width}: ${JSON.stringify(t.lead)}`);
  if (t.section&&(t.section.size<32||t.section.size>48||t.section.weight!==700)) throw new Error(`section typography ${route} ${width}: ${JSON.stringify(t.section)}`);
```

Run against the current CSS state before fixing any unexpected computed-style mismatch:

```bash
CDP_PORT=9226 BASE_URL=http://127.0.0.1:4173 OUTPUT_DIR=/tmp/virtual-cell-type-red node scripts/visual-detail-check.mjs
```

Expected: exit 1 if any page-specific override escaped the shared CSS work. The error must name the route, viewport, role, and computed values.

- [ ] **Step 3: Fix only root-cause selector escapes**

For each failure, trace the winning declaration with browser computed styles and change the shared selector in `assets/css/landing.css` or `assets/css/organizers.css`. Do not add route-specific `!important` declarations. Re-run the single failing route manually in Chrome before repeating the full matrix.

The acceptable fixes are limited to:

```css
font-size: var(--bs-type-hero-home);
font-size: var(--bs-type-hero-page);
font-size: var(--bs-type-section);
font-size: var(--bs-type-lead);
font-size: var(--bs-type-body);
font-size: var(--bs-type-action);
font-weight: var(--bs-weight-display);
line-height: 1.08;
line-height: 1.1;
line-height: var(--bs-leading-lead);
line-height: var(--bs-leading-body);
```

If geometry fails because text becomes larger, reduce existing padding or gap at the shared responsive breakpoint. Do not shrink text below the contract.

- [ ] **Step 4: Run the full browser matrix**

```bash
node --check scripts/visual-detail-check.mjs
CDP_PORT=9226 BASE_URL=http://127.0.0.1:4173 OUTPUT_DIR=/tmp/virtual-cell-type-final node scripts/visual-detail-check.mjs
```

Expected:

```text
PASS: 36 visual detail captures
PASS: 8 full-page captures
PASS: 9 font-fallback captures
```

- [ ] **Step 5: Perform the visual hierarchy verdict**

Use `visual-verdict`, `critique-visual-hierarchy`, and `frontend-design-review` on these fresh captures:

```text
/tmp/virtual-cell-type-final/index-1440x1100.png
/tmp/virtual-cell-type-final/index-390x844.png
/tmp/virtual-cell-type-final/index-full-1440.png
/tmp/virtual-cell-type-final/leaderboard-1440x1100.png
/tmp/virtual-cell-type-final/leaderboard-390x844.png
/tmp/virtual-cell-type-final/awards-1440x1100.png
/tmp/virtual-cell-type-final/organizers-390x844.png
```

Compare them with the saved reference captures:

```text
/tmp/virtual-cell-1440x1100.png
/tmp/virtual-cell-390x844.png
```

The review must explicitly verify:

- Supporting text and actions no longer look undersized beside headings.
- Semantic headings read calmer and less compressed than the deployed baseline.
- Trophy, figures, proof rails, tables, and organizer portraits retain their intended visual priority.
- Section cadence resembles the reference's 96px/64px rhythm.
- No page looks mechanically copied from Virtual Cell or loses the EEG/EMG identity.

- [ ] **Step 6: Run accessibility and resilience checks**

In Chrome DevTools, verify the following at 320px, 390px, 834px, and 1440px:

1. Zoom text to 200%; confirm no clipped navigation, CTA, hero title, table control, or code-scroller label.
2. Block `fonts.googleapis.com` and `fonts.gstatic.com`; confirm the 320px fallback screenshots remain contained.
3. Disable JavaScript; confirm all `.reveal` content remains visible and all native tables/details remain usable.
4. Emulate `prefers-reduced-motion: reduce`; confirm content is visible without animated dependency.
5. Confirm every button and menu control remains at least 44×44px.
6. Confirm focus outlines remain visible on header, CTA, local navigation, code scrollers, and footer links.

- [ ] **Step 7: Verify and commit the browser gate**

```bash
python3 scripts/design-check.py --scope typography
python3 scripts/design-check.py --scope all
node --check assets/js/ui.js
node --check scripts/visual-detail-check.mjs
PYTHONPYCACHEPREFIX=/tmp/virtual-cell-type-pycache python3 -m py_compile scripts/design-check.py scripts/coverage-check.py scripts/export-brand-assets.py
git diff --check
git status --short
```

Expected: all commands exit 0; `git status --short` lists only the intended plan, specification, design contract, CSS, and check-script files.

```bash
git add DESIGN.md assets/css/tokens.css assets/css/base.css assets/css/landing.css assets/css/organizers.css scripts/design-check.py scripts/visual-detail-check.mjs docs/superpowers/specs/2026-08-31-virtual-cell-typography-recalibration.md docs/superpowers/plans/2026-08-31-virtual-cell-typography-recalibration.md
git commit -m "test: lock editorial typography calibration"
```

---

### Task 5: Independent Review and Release Handoff

**Files:**
- Review only: all files changed by Tasks 1–4

**Interfaces:**
- Consumes: the complete typography implementation and fresh visual evidence.
- Produces: an independent specification-compliance verdict, code-quality verdict, clean branch, and an exact commit ready for deployment.

- [ ] **Step 1: Request specification-compliance review**

Use a fresh reviewer with `superpowers:requesting-code-review`. Give the reviewer the specification path, plan path, full `main..HEAD` diff, and the `/tmp/virtual-cell-type-final` screenshot directory. The reviewer must check every acceptance criterion and report findings by severity with file and line references.

- [ ] **Step 2: Request code-quality review**

Use a second fresh reviewer. Require checks for duplicate overrides, specificity escalation, accidental changes to numeric exceptions, unsupported font weights, navigation wrapping, stale comments, and changes outside the declared file set.

- [ ] **Step 3: Resolve findings at their shared source**

For every valid finding, patch the shared token or selector that controls all affected routes. Re-run the smallest failing check, then the entire verification command from Task 4 Step 7 and the visual matrix from Task 4 Step 4.

- [ ] **Step 4: Run final fresh verification**

```bash
python3 scripts/design-check.py --scope typography
python3 scripts/design-check.py --scope all
node --check assets/js/ui.js
node --check scripts/visual-detail-check.mjs
PYTHONPYCACHEPREFIX=/tmp/virtual-cell-type-final-pycache python3 -m py_compile scripts/design-check.py scripts/coverage-check.py scripts/export-brand-assets.py
git diff --check
CDP_PORT=9226 BASE_URL=http://127.0.0.1:4173 OUTPUT_DIR=/tmp/virtual-cell-type-release node scripts/visual-detail-check.mjs
git status --short --branch
git log --oneline --decorate -6
```

Expected: static checks pass; JavaScript and Python compile; 36 viewport, 8 full-page, and 9 font-fallback captures pass; the worktree is clean; the final commit is identified.

- [ ] **Step 5: Prepare deployment handoff**

Report the final commit hash, changed files, exact test evidence, screenshot directory, and public deployment command:

```bash
git -C /Users/bruaristimunha/Projects/websites/neuralinterface26.github.io merge --ff-only codex/visual-identity-redesign
git -C /Users/bruaristimunha/Projects/websites/neuralinterface26.github.io push origin main
```

Do not run the push until the user selects the execution path and the implementation passes Task 5 Step 4.

---

## Self-Review Record

- Spec coverage: every typography, spacing, exception, accessibility, responsive, and dependency constraint maps to Tasks 1–5.
- Task boundaries: foundation, homepage, secondary pages, browser gate, and independent release review each have a separate red/green cycle and commit.
- File responsibility: no HTML or JavaScript application logic change is planned; CSS changes remain in existing shared files.
- Dependency check: no installation is required; the repository remains a static site with no build step.
- Type and property consistency: every component consumes the exact custom-property names defined in Task 1.
- Placeholder scan: the plan contains exact values, selectors, commands, expected outcomes, and review inputs.
