# EEG/EMG Challenge Visual Identity Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the complete static challenge website around the approved PSD trophy identity while preserving all competition facts, routes, anchors, and technical content.

**Architecture:** Keep the existing static HTML/CSS/vanilla-JS stack. Extract reproducible web assets from the PSD, replace the accumulated landing stylesheet with one coherent responsive system, replace the site-wide documentation sidebar with a shared top header, and recompose the homepage as the campaign flagship while retaining focused technical layouts on secondary pages. A stdlib-only audit script, existing content coverage script, headless screenshots, and Lighthouse provide the verification gates.

**Tech Stack:** Static HTML5, CSS custom properties/Grid/Flexbox, vanilla JavaScript, Python 3 stdlib, `uv` with ephemeral `psd-tools` and Pillow for design exports, ImageMagick for asset inspection, Chrome headless/Lighthouse for final QA.

**Spec:** `docs/superpowers/specs/2026-08-30-visual-identity-redesign.md`

**Required design skills during execution:**

- `redesign-existing-projects` for the scan → diagnose → targeted-fix workflow in Tasks 2–6.
- Installed `Photoshop` skill for any bounded source-layer inspection or correction in Task 1; its Flue bridge requires separate setup approval before it can control Photoshop.
- Installed `mono-color` skill from `yanliudesign/mono-color-skill` for the plate, whitespace, type/object, focal-event, and originality gates in Tasks 2–6. Translate it through the PSD palette; do not generate a substitute trophy or copy a reference poster.
- `visual-verdict` for the scored screenshot loop in Task 8. PASS requires a weighted score of at least 90/100.

**Direct visual references:**

- Mono-color post: `https://x.com/yanliudreamer/status/2093968800316293400?s=20`
- Mono-color skill: `https://github.com/yanliudesign/mono-color-skill`
- Mono-color board: `https://raw.githubusercontent.com/yanliudesign/mono-color-skill/main/examples/mono-color-design-system-board.png`
- Reference sheet 01–06: `https://pbs.twimg.com/media/HQ9FGqTbcAAAMyZ.jpg?name=orig`
- Reference sheet 07–12: `https://pbs.twimg.com/media/HQ9FGqRbAAANhXk.jpg?name=orig`
- Reference system: `https://pbs.twimg.com/media/HQ9FGqUa8AAII6g.jpg?name=orig`
- Composition grammar: `https://pbs.twimg.com/media/HQ9FGqRbQAAAX-U.jpg?name=orig`
- DESIGN.md post: `https://x.com/Voxyz_ai/status/2093766772029559077?s=20`
- Refero library: `https://styles.refero.design/`
- Refero Linear example: `https://styles.refero.design/style/90ce5883-bb24-4466-93f7-801cd617b0d1`
- Refero Notion example: `https://styles.refero.design/style/2bf4c61f-de10-4614-ba1b-20c0453bd2a9`
- Scientific challenge benchmark: `https://virtualcellchallenge.org/`
- Benchmark hero texture: `https://virtualcellchallenge.org/homepage/hero-bgnd.png`
- Benchmark prize illustration: `https://virtualcellchallenge.org/homepage/prizes-bg.png`

## Global Constraints

- `Linkedin Post 1.psd` controls visual identity.
- `docs/CONTENT_INVENTORY.md` controls competition facts.
- Primary violet is exactly `#5332F4`; ink is `#07101F`; lavender ground is `#F7F5FC`.
- UI and campaign graphics use a two-plate model: violet carries emphasis and image energy; ink carries copy, rules, and metadata. The PSD trophy, scientific figures, portraits, and sponsor marks are source-art exceptions, not permission for extra UI accents.
- Every campaign composition has exactly one focal event, one quiet release zone, 25%–55% visibly open paper, and at most one manual gesture family.
- Display hierarchy uses a 5×–12× jump over microcopy where space permits; factual text is never distorted, screened, or hidden by overlap.
- No fake aging, sepia, torn-paper collage, decorative grunge, stickers, blobs, centered poster templates, or copied reference arrangements.
- Display and body text use Noto Sans; code uses IBM Plex Mono.
- Keep static HTML, CSS, and vanilla JavaScript.
- No framework migration and no runtime dependency.
- Do not commit the PSD or embedded PSBs.
- Keep the existing anchor IDs `#tracks`, `#timeline`, `#datasets`, `#sponsors`, and `#cta`.
- Desktop trophy WebP: 2400×1260, at most 700 KB.
- Mobile trophy WebP: 1400×1400, at most 500 KB.
- Open Graph PNG: 1200×627, at most 700 KB.
- Initial homepage transfer: at most 1.8 MB on an empty cache.
- Lighthouse mobile targets: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95.
- No animation library, scroll hijacking, custom cursor, or continuously running decorative effect is added.
- No copy, date, prize, metric, sponsor role, or dataset fact changes as part of this redesign.

---

## File Map

### Create

- `.gitignore` — prevents the 346 MB PSD, embedded PSBs, partial downloads, and Finder metadata from entering Git.
- `DESIGN.md` — agent-readable identity contract with source links, exact tokens, composition grammar, component rules, and do/don't constraints.
- `assets/img/brand/hero-trophy.webp` — wide desktop hero export from the embedded 4768×2504 trophy composite.
- `assets/img/brand/hero-trophy-mobile.webp` — square mobile crop of the same source.
- `scripts/export-brand-assets.py` — deterministic PSD-to-web export command.
- `scripts/design-check.py` — stdlib-only structural, accessibility, token, anchor, and asset-budget checks.
- `404.html` — branded recovery route.

### Modify

- `assets/img/og-card.png` — replace the old dark card with PSD artboard 1.
- `assets/css/tokens.css` — exact PSD colors, Noto Sans family, radii, shadows, motion values.
- `assets/css/base.css` — reset, type scale, buttons, focus states, glass material, code blocks, reduced motion.
- `assets/css/landing.css` — replace accumulated overrides with the global shell, homepage, secondary-page, table, sponsor, and responsive layouts.
- `assets/css/organizers.css` — keep only organizer-specific portrait and affiliation layout.
- `assets/js/ui.js` — shared mobile menu, reveal observer, counter, copy feedback, countdown, and active navigation.
- `index.html` — campaign homepage composition and trophy hero.
- `startkit.html`, `faq.html`, `leaderboard.html`, `awards.html`, `organizers.html`, `ethics.html`, `track-record.html` — shared shell and focused secondary-page presentation.
- `sitemap.xml` — retain the eight public routes and their current canonical domain; do not add the 404 route.

### Preserve

- `assets/js/eeg.js` — current signal rendering.
- `assets/img/figures/*`, `assets/img/people/*`, `assets/img/logos/*` — current scientific figures, portraits, and sponsor logos.
- `docs/CONTENT_INVENTORY.md` — content source of truth.
- `scripts/coverage-check.py` — factual/anchor regression gate.

---

### Task 1: Reproducible PSD Asset Pipeline

**Files:**
- Create: `.gitignore`
- Create: `scripts/export-brand-assets.py`
- Create: `assets/img/brand/hero-trophy.webp`
- Create: `assets/img/brand/hero-trophy-mobile.webp`
- Modify: `assets/img/og-card.png`
- Read: `Linkedin Post 1.psd`

**Interfaces:**
- Consumes: PSD artboard `1` and the visible `Expansão generativa` smart object whose embedded data exceeds 90 MB.
- Produces: the three exact image paths consumed by `index.html` metadata and hero `<picture>` markup.

- [ ] **Step 1: Record the current failing asset state**

Run:

```bash
test -s assets/img/brand/hero-trophy.webp \
  && test -s assets/img/brand/hero-trophy-mobile.webp \
  && identify assets/img/og-card.png
```

Expected: FAIL because the `assets/img/brand` exports do not exist; the existing Open Graph image reports 1200×630 and shows the retired dark design.

- [ ] **Step 2: Ignore design source files without deleting them**

Create `.gitignore` with exactly:

```gitignore
.DS_Store
*.part
*.psb
*.psd
```

Run `git status --short` and confirm `Linkedin Post 1.psd` no longer appears. Do not remove or move the PSD.

- [ ] **Step 3: Add the deterministic exporter**

Create `scripts/export-brand-assets.py` with this public CLI and behavior:

```python
from __future__ import annotations

import argparse
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps
from psd_tools import PSDImage


def save_webp(image: Image.Image, path: Path, size: tuple[int, int]) -> None:
    output = ImageOps.fit(
        image.convert("RGB"),
        size,
        method=Image.Resampling.LANCZOS,
        centering=(0.54, 0.56),
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    output.save(path, "WEBP", quality=88, method=6)


def export(source: Path, root: Path) -> None:
    psd = PSDImage.open(source)
    if (psd.width, psd.height) != (3800, 627):
        raise ValueError(f"unexpected PSD geometry: {psd.width}x{psd.height}")

    trophy_layer = next(
        layer
        for layer in psd.descendants()
        if layer.kind == "smartobject"
        and layer.name == "Expansão generativa"
        and len(layer.smart_object.data) > 90_000_000
    )
    trophy_psb = PSDImage.open(BytesIO(trophy_layer.smart_object.data))
    trophy = trophy_psb.composite()
    if trophy is None or trophy.size != (4768, 2504):
        raise ValueError("approved 4768x2504 trophy composite was not found")

    brand = root / "assets" / "img" / "brand"
    save_webp(trophy, brand / "hero-trophy.webp", (2400, 1260))
    save_webp(trophy, brand / "hero-trophy-mobile.webp", (1400, 1400))

    social = psd[0].composite()
    if social is None or social.size != (1200, 627):
        raise ValueError("artboard 1 is not the expected 1200x627 social card")
    social.convert("RGB").save(root / "assets" / "img" / "og-card.png", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    export(args.source, args.root)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Export the approved assets**

Run:

```bash
uv run --with 'psd-tools>=1.10,<2' --with 'Pillow>=10,<13' \
  python scripts/export-brand-assets.py --source 'Linkedin Post 1.psd'
```

Expected: exit 0 and three non-empty outputs.

- [ ] **Step 5: Verify geometry, format, and byte budgets**

Run:

```bash
identify -format '%f %wx%h %[colorspace]\n' \
  assets/img/brand/hero-trophy.webp \
  assets/img/brand/hero-trophy-mobile.webp \
  assets/img/og-card.png
test "$(stat -f %z assets/img/brand/hero-trophy.webp)" -le 716800
test "$(stat -f %z assets/img/brand/hero-trophy-mobile.webp)" -le 512000
test "$(stat -f %z assets/img/og-card.png)" -le 716800
```

Expected: `2400x1260`, `1400x1400`, and `1200x627`, all sRGB and within budget.

- [ ] **Step 6: Visually inspect all three exports**

Confirm the desktop export retains the entire sculpture and base, the mobile crop does not cut the violet waveform or stone base, and the social card contains no clipped type or stale URL.

- [ ] **Step 7: Commit the export pipeline and web assets**

```bash
git add .gitignore scripts/export-brand-assets.py assets/img/brand assets/img/og-card.png
git commit -m "design: export approved trophy identity for web"
```

---

### Task 2: Identity Tokens and Automated Design Gate

**Files:**
- Create: `DESIGN.md`
- Create: `scripts/design-check.py`
- Modify: `assets/css/tokens.css`
- Modify: `assets/css/base.css`
- Modify: all eight existing HTML files (font request only)

**Interfaces:**
- Consumes: exact PSD constants from the spec.
- Produces: the agent-readable visual contract, CSS variables used by every later task, and `python3 scripts/design-check.py --scope <name>` for incremental verification.

- [ ] **Step 1: Create the machine-readable design contract**

Create root `DESIGN.md` before editing UI. It must directly link every URL in the plan's **Direct visual references** section and contain these exact sections:

1. `North star` — “A scientific signal trophy on clean paper: one violet event, rigorous ink typography, and enough silence to feel institutional.”
2. `Source hierarchy` — PSD first, content inventory second, existing routes/content third, reference grammar fourth.
3. `Colors and plate roles` — exact PSD values, opacity values, permitted source-art exceptions, and the no-third-accent rule.
4. `Typography` — Noto Sans and IBM Plex Mono roles, responsive size ranges, 5×–12× display/microcopy relationship, and tight display tracking.
5. `Spacing and layout` — 4 px base, page widths, breakpoints, 25%–55% open-paper target, one focal event, one release zone.
6. `Components` — header, buttons, glass panels, track modules, timeline, sponsor stage, data tables, code blocks, and footer.
7. `Motion and texture` — subtle halftone/grain only, no effect on legibility, reduced-motion behavior.
8. `Do / Don't` — include every mono-color rejection in Global Constraints and the reference originality firewall.
9. `Page recipes` — homepage as `editorial cover`; technical pages as `editorial journal`; track grid as `ruled information poster`; awards as `type-led declaration`.
10. `QA rubric` — reference fidelity, identity fidelity, responsive behavior, accessibility, performance, and originality.

Run:

```bash
rg -n "yanliudesign/mono-color-skill|styles.refero.design|virtualcellchallenge.org|#5332F4|one focal event|release zone|Do / Don't" DESIGN.md
```

Expected: every source family and every load-bearing visual rule is present.

- [ ] **Step 2: Write the design check before changing tokens**

Create `scripts/design-check.py` with these scopes and exact assertions:

```python
from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    "index.html", "startkit.html", "faq.html", "leaderboard.html",
    "awards.html", "organizers.html", "ethics.html", "track-record.html",
]
TOKENS = {
    "--bs-violet": "#5332f4",
    "--bs-text": "#07101f",
    "--bs-surface": "#f7f5fc",
    "--bs-card-border": "#e3dbf4",
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.hrefs: list[str] = []
        self.images: list[dict[str, str]] = []
        self.classes: list[str] = []
        self.inline_styles = 0
        self.tags: dict[str, int] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key: value or "" for key, value in attrs}
        self.tags[tag] = self.tags.get(tag, 0) + 1
        if data.get("id"):
            self.ids.append(data["id"])
        if tag == "a":
            self.hrefs.append(data.get("href", ""))
        if tag == "img":
            self.images.append(data)
        if data.get("class"):
            self.classes.extend(data["class"].split())
        if "style" in data:
            self.inline_styles += 1


def parse_page(name: str) -> tuple[str, PageParser]:
    text = (ROOT / name).read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(text)
    return text, parser


def check_tokens(errors: list[str]) -> None:
    css = (ROOT / "assets/css/tokens.css").read_text(encoding="utf-8").lower()
    for token, value in TOKENS.items():
        if not re.search(rf"{re.escape(token)}\s*:\s*{value}\b", css):
            errors.append(f"tokens: {token} must be {value}")
    if '"noto sans"' not in css:
        errors.append("tokens: Noto Sans is not the sans/display family")


def check_shell(errors: list[str]) -> None:
    for page in PAGES:
        text, parsed = parse_page(page)
        if parsed.tags.get("header") != 1 or parsed.tags.get("main") != 1 or parsed.tags.get("footer") != 1:
            errors.append(f"{page}: requires one header, main, and footer")
        if len(parsed.ids) != len(set(parsed.ids)):
            errors.append(f"{page}: duplicate ids")
        if "vb-sidebar" in parsed.classes:
            errors.append(f"{page}: old sidebar remains")
        if parsed.inline_styles:
            errors.append(f"{page}: {parsed.inline_styles} inline style attributes")
        if "skip-link" not in parsed.classes or 'href="#main"' not in text:
            errors.append(f"{page}: skip link missing")
        for href in parsed.hrefs:
            if href in {"", "#"}:
                errors.append(f"{page}: dead href {href!r}")
        for image in parsed.images:
            if "alt" not in image:
                errors.append(f"{page}: image without alt attribute")


def check_home(errors: list[str]) -> None:
    text, parsed = parse_page("index.html")
    for anchor in ("tracks", "timeline", "datasets", "sponsors", "cta"):
        if anchor not in parsed.ids:
            errors.append(f"index.html: missing #{anchor}")
    for asset in ("hero-trophy.webp", "hero-trophy-mobile.webp"):
        if asset not in text:
            errors.append(f"index.html: missing {asset}")
    if "Train once. Generalize across signals." not in text:
        errors.append("index.html: approved hero heading missing")
    if "bs-code" in text[text.find('<section class="campaign-hero"'):text.find("</section>")]:
        errors.append("index.html: code sample remains inside hero")


def check_metadata(errors: list[str]) -> None:
    for page in PAGES + ["404.html"]:
        text = (ROOT / page).read_text(encoding="utf-8")
        for needle in ('<meta name="description"', '<meta name="viewport"', '<title>'):
            if needle not in text:
                errors.append(f"{page}: missing {needle}")
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    if 'content="#5332f4"' not in index.lower():
        errors.append("index.html: theme-color is not approved violet")
    if "assets/img/og-card.png" not in index:
        errors.append("index.html: Open Graph image path missing")


def check_assets(errors: list[str]) -> None:
    limits = {
        "assets/img/brand/hero-trophy.webp": 716_800,
        "assets/img/brand/hero-trophy-mobile.webp": 512_000,
        "assets/img/og-card.png": 716_800,
    }
    for name, limit in limits.items():
        path = ROOT / name
        if not path.is_file() or path.stat().st_size > limit:
            errors.append(f"{name}: missing or larger than {limit} bytes")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--scope",
        choices=("tokens", "shell", "home", "metadata", "assets", "all"),
        default="all",
    )
    scope = parser.parse_args().scope
    errors: list[str] = []
    checks = {
        "tokens": check_tokens,
        "shell": check_shell,
        "home": check_home,
        "metadata": check_metadata,
        "assets": check_assets,
    }
    selected = checks.values() if scope == "all" else [checks[scope]]
    for check in selected:
        check(errors)
    if errors:
        print("\n".join(f"FAIL: {error}" for error in errors))
        return 1
    print(f"PASS: design checks ({scope})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 3: Run the token scope and verify it fails**

Run: `python3 scripts/design-check.py --scope tokens`

Expected: FAIL for `--bs-violet`, `--bs-text`, `--bs-surface`, `--bs-card-border`, and Noto Sans.

- [ ] **Step 4: Replace tokens with the PSD identity**

In `assets/css/tokens.css`, retain existing variable names but set:

```css
:root {
  --bs-fontdisplay: "Noto Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --bs-fontsans: "Noto Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --bs-fontmono: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace;
  --bs-bg: #ffffff;
  --bs-surface: #f7f5fc;
  --bs-text: #07101f;
  --bs-muted: #5a6378;
  --bs-faint: #666b84;
  --bs-card: rgba(255, 255, 255, 0.92);
  --bs-card-border: #e3dbf4;
  --bs-violet: #5332f4;
  --bs-violet-deep: #3f1bc7;
  --bs-violet-soft: #ae99e5;
  --bs-violet-wash: rgba(83, 50, 244, 0.08);
  --bs-code-bg: #0b1020;
  --bs-radius-sm: 8px;
  --bs-radius-md: 12px;
  --bs-radius-card: 18px;
  --bs-radius-pill: 999px;
  --bs-shadow-card: 0 18px 50px -28px rgba(83, 50, 244, 0.28);
  --bs-shadow-card-lift: 0 26px 64px -30px rgba(83, 50, 244, 0.38);
  --bs-focus: 0 0 0 3px rgba(83, 50, 244, 0.28);
  --bs-anim-speed: 1;
}
```

- [ ] **Step 5: Update the font request on all eight pages**

Replace the current Google Fonts URL with one request for Noto Sans weights `300;400;500;600;700;800;900` and IBM Plex Mono weights `400;500;600`. Remove Archivo, Manrope, and Source Serif 4 from page markup.

- [ ] **Step 6: Consolidate reusable atoms in `base.css`**

Keep the reset, skip link, button, badge, pill, code block, and reduced-motion behavior. Add:

```css
:focus-visible { outline: none; box-shadow: var(--bs-focus); }

.glass-panel {
  background: var(--bs-card);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: var(--bs-shadow-card), inset 0 1px 0 rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 500ms ease, transform 500ms cubic-bezier(.2,.7,.2,1);
}

.reveal.is-visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .reveal { opacity: 1; transform: none; }
}
```

- [ ] **Step 7: Run token and asset checks**

```bash
python3 scripts/design-check.py --scope tokens
python3 scripts/design-check.py --scope assets
```

Expected: both PASS.

- [ ] **Step 8: Commit the identity foundation**

```bash
git add DESIGN.md scripts/design-check.py assets/css/tokens.css assets/css/base.css \
  index.html startkit.html faq.html leaderboard.html awards.html \
  organizers.html ethics.html track-record.html
git commit -m "design: align site tokens with approved PSD identity"
```

---

### Task 3: Shared Header, Footer, and Responsive Shell

**Files:**
- Modify: `assets/css/landing.css`
- Modify: `assets/js/ui.js`
- Modify: all eight existing HTML files

**Interfaces:**
- Consumes: tokens and atoms from Task 2.
- Produces: `.site-header`, `#site-menu`, `.site-main`, `.site-footer`, and `initSiteMenu()` used by every page.

- [ ] **Step 1: Run the shell audit and verify the old structure fails**

Run: `python3 scripts/design-check.py --scope shell`

Expected: FAIL because pages still contain `.vb-sidebar`, lack a semantic site header, and contain inline style attributes.

- [ ] **Step 2: Replace the repeated sidebar/topbar with one header pattern**

Use this exact structure on every page, changing only `aria-current="page"` on the active route:

```html
<header class="site-header">
  <a class="site-brand" href="index.html" aria-label="EEG/EMG Foundation Challenge home">
    <span class="site-brand-mark" aria-hidden="true">∿</span>
    <span>EEG/EMG Foundation</span>
  </a>
  <button class="site-menu-toggle" type="button" aria-controls="site-menu" aria-expanded="false">
    <span class="sr-only">Open navigation</span>
    <span aria-hidden="true"></span><span aria-hidden="true"></span>
  </button>
  <nav class="site-menu" id="site-menu" aria-label="Primary navigation">
    <a href="index.html#tracks">Tracks</a>
    <a href="index.html#timeline">Timeline</a>
    <a href="startkit.html">Start kit</a>
    <a href="leaderboard.html">Leaderboard</a>
    <a href="faq.html">Rules</a>
    <a href="organizers.html">Organizers</a>
    <a class="bs-btn primary sm" href="mailto:neurips2026-eeg-emg-competition@googlegroups.com?subject=Register%20team%20for%20EEG%2FEMG%20Foundation%20Challenge%202026">Register</a>
  </nav>
</header>
```

Every page keeps `<a class="skip-link" href="#main">Skip to content</a>` before the header and exactly one `<main class="site-main" id="main">` after it.

- [ ] **Step 3: Standardize the footer**

Use one footer pattern with the challenge name, `Start kit`, `Rules`, `Ethics`, `GitHub`, and organizer email. Keep sponsor logos in the dedicated homepage section rather than duplicating them in every footer.

- [ ] **Step 4: Replace `landing.css` with one coherent shell**

Remove the old sidebar/topbar rules and late override strata. Implement:

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 12px clamp(20px, 4vw, 64px);
  background: rgba(247, 245, 252, 0.88);
  border-bottom: 1px solid rgba(227, 219, 244, 0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.site-menu { display: flex; align-items: center; gap: clamp(14px, 2vw, 28px); }
.site-menu-toggle { display: none; width: 44px; height: 44px; }
.site-main { min-width: 0; overflow: clip; }
.page-shell { width: min(100% - 40px, 1440px); margin-inline: auto; }
.reading-width { max-width: 65ch; }

@media (max-width: 900px) {
  .site-menu-toggle { display: grid; place-content: center; }
  .site-menu {
    position: fixed;
    inset: 72px 16px auto;
    display: grid;
    padding: 20px;
    border-radius: var(--bs-radius-card);
    background: rgba(255, 255, 255, 0.98);
    box-shadow: var(--bs-shadow-card-lift);
    transform: translateY(-12px);
    opacity: 0;
    pointer-events: none;
  }
  .site-menu.is-open { transform: none; opacity: 1; pointer-events: auto; }
}
```

- [ ] **Step 5: Replace mobile sidebar behavior with `initSiteMenu()`**

In `assets/js/ui.js`, remove `initMobileNav()` and add:

```javascript
function initSiteMenu() {
  const toggle = document.querySelector('.site-menu-toggle');
  const menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;

  const close = ({ restoreFocus = false } = {}) => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (open) return close();
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      close({ restoreFocus: true });
    }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', close);
}
```

Call `initSiteMenu()` from `init()` and retain counter, copy, countdown, display-stop, and leaderboard-tab initialization.

- [ ] **Step 6: Remove inline style attributes and obsolete sidebar elements**

Move the four dataset heading declarations from `index.html` into named classes. Remove `.preview-banner`, `.vb-sidebar`, `.sidebar-scrim`, `.vb-top`, breadcrumb markup, and their CSS. Preserve preview copy below the hero as a normal announcement strip.

- [ ] **Step 7: Run structural and content gates**

```bash
python3 scripts/design-check.py --scope shell
python3 scripts/coverage-check.py
```

Expected: both PASS.

- [ ] **Step 8: Commit the shared shell**

```bash
git add assets/css/landing.css assets/js/ui.js \
  index.html startkit.html faq.html leaderboard.html awards.html \
  organizers.html ethics.html track-record.html
git commit -m "design: replace documentation sidebar with shared site shell"
```

---

### Task 4: Campaign Homepage and Trophy Hero

**Files:**
- Modify: `index.html`
- Modify: `assets/css/landing.css`
- Modify: `assets/js/ui.js`

**Interfaces:**
- Consumes: `hero-trophy.webp`, `hero-trophy-mobile.webp`, shared header/footer, current section facts, current track figures, and existing anchor IDs.
- Produces: `.campaign-hero`, `.proof-strip`, `.challenge-thesis`, `.track-grid`, `.evidence-strip`, `.timeline-panel`, `.prize-panel`, `.sponsor-wall`, and `.register-panel`.

- [ ] **Step 1: Run the homepage audit and verify it fails**

Run: `python3 scripts/design-check.py --scope home`

Expected: FAIL because the trophy image and approved hero heading are absent and the old code sample remains in the hero.

- [ ] **Step 2: Build the four-element hero**

Replace the current hero with:

```html
<section class="campaign-hero" aria-labelledby="hero-heading">
  <picture class="campaign-hero-art">
    <source media="(max-width: 640px)" srcset="assets/img/brand/hero-trophy-mobile.webp" />
    <img src="assets/img/brand/hero-trophy.webp" width="2400" height="1260"
      alt="Violet neural-signal sculpture rising from a stone trophy base" fetchpriority="high" />
  </picture>
  <div class="campaign-hero-copy reveal">
    <p class="bs-eyebrow">EEG/EMG Foundation Challenge · NeurIPS 2026</p>
    <h1 id="hero-heading">Train once.<br />Generalize across signals.</h1>
    <p>Four decoding tracks test models across stimuli, sessions, devices, and people.</p>
    <div class="bs-hero-cta">
      <a class="bs-btn primary" href="mailto:neurips2026-eeg-emg-competition@googlegroups.com?subject=Register%20team%20for%20EEG%2FEMG%20Foundation%20Challenge%202026">Register your team</a>
      <a class="bs-btn ghost" href="#tracks">Explore the tracks</a>
    </div>
  </div>
</section>
```

Desktop copy occupies the left 42%; the trophy fills the right 68% and may overlap the copy column only inside its empty ambient background. At 640 px, copy precedes the square crop.

Treat the headline and trophy as one `editorial cover` composition from `DESIGN.md`: the trophy is the sole focal event, the upper-left paper field is the release zone, and the violet full stop/registration rule is the only manual gesture family. Keep 25%–55% of the section visibly open, and do not add decorative badges, blobs, texture cards, or a third accent.

- [ ] **Step 3: Move proof immediately below the hero**

Use one horizontal proof strip with the exact 2025 figures already present: `1,197 teams`, `247 institutions`, `50+ countries`, and `8,622 submissions`. No logo wall or tertiary hero text enters the hero.

- [ ] **Step 4: Build the thesis and four-track composition**

Introduce `One benchmark. Four real shifts.` followed by the PSD-approved 2×2 sequence:

| Number | Track | Shift | Existing figure | Destination |
|---|---|---|---|---|
| `01` | `EEG-to-IMG` | `Cross-stimulus` | `assets/img/figures/eeg-to-img.png` | `leaderboard.html#track-1` |
| `02` | `BCI decoding` | `Cross-session` | `assets/img/figures/bci-track.png` | `leaderboard.html#track-2` |
| `03` | `Sleep onset` | `Cross-device` | `assets/img/figures/sleep_prediction.png` | `leaderboard.html#track-3` |
| `04` | `EMG-to-Text` | `Cross-user` | `assets/img/figures/emg-to-text.png` | `leaderboard.html#track-4` |

Each card keeps its current task description and data facts. Use `loading="lazy"`, explicit dimensions, descriptive alt text, and one consistent text-link label: `View track`.

- [ ] **Step 5: Recompose evidence, timeline, prize, sponsors, and registration**

Keep existing facts and IDs but use distinct layout families:

- `#datasets`: border-separated evidence strip for `14 public datasets`, `3,700+ subjects`, `BIDS-first`, and `sealed replay`.
- `#timeline`: one full-width horizontal line on desktop and vertical sequence on mobile.
- Prize panel: oversized `$30,000`, supporting `$2,500 / top-3 / track`, link to `awards.html`, and a subtle violet ambient crop derived through CSS from the hero image; do not load a second copy of the bitmap.
- `#sponsors`: grouped real logos under `Platform`, `Track partners`, and `Organizing institutions`.
- `#cta`: final heading `Ready to test your model?` and the same `Register your team` mailto action.

- [ ] **Step 6: Add homepage layout and motion styles**

Implement the hero with `min-height`, never fixed `height`:

```css
.campaign-hero {
  position: relative;
  min-height: min(760px, calc(100dvh - 72px));
  display: grid;
  align-items: center;
  overflow: hidden;
  background: var(--bs-surface);
}

.campaign-hero-art {
  position: absolute;
  inset: 0;
  display: block;
}

.campaign-hero-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 58% 50%;
}

.campaign-hero-copy {
  position: relative;
  z-index: 1;
  width: min(92%, 1440px);
  margin-inline: auto;
  padding: 72px 56% 82px 0;
}

.track-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }

@media (max-width: 640px) {
  .campaign-hero { grid-template-rows: auto auto; min-height: 0; }
  .campaign-hero-copy { padding: 56px 0 24px; width: min(100% - 40px, 640px); }
  .campaign-hero-art { position: relative; grid-row: 2; aspect-ratio: 4 / 3; }
  .campaign-hero-art img { object-position: 50% 58%; }
  .track-grid { grid-template-columns: 1fr; }
}
```

Add `initReveals()` using one `IntersectionObserver` at threshold `0.12`; if reduced motion is active, apply `.is-visible` immediately.

- [ ] **Step 7: Run homepage and content gates**

```bash
python3 scripts/design-check.py --scope home
python3 scripts/coverage-check.py
```

Expected: both PASS.

- [ ] **Step 8: Capture and inspect the homepage at three sizes**

Start `./scripts/serve.sh`, then capture 1440×900, 768×1024, and 390×844. Verify the desktop CTA is visible in the initial viewport, the H1 is at most two lines on desktop, the trophy is not clipped, and no viewport has horizontal overflow.

- [ ] **Step 9: Commit the flagship homepage**

```bash
git add index.html assets/css/landing.css assets/js/ui.js
git commit -m "design: build campaign homepage around trophy identity"
```

---

### Task 5: Technical Secondary Pages

**Files:**
- Modify: `startkit.html`
- Modify: `leaderboard.html`
- Modify: `faq.html`
- Modify: `assets/css/landing.css`

**Interfaces:**
- Consumes: shared shell and page-hero styles.
- Produces: `.page-hero`, `.local-nav`, `.steps-list`, `.table-shell`, `.formal-block`, `.rules-list`, and `.faq-list` patterns.

- [ ] **Step 1: Record technical-page visual failures**

Serve the site and capture the three pages at 1440×900 and 390×844. Record overflow, heading-wrap, code-block, table, and local-navigation issues in the task notes before editing.

- [ ] **Step 2: Apply one compact page hero pattern**

Each page hero contains one eyebrow at most, the existing H1, one paragraph no wider than 65 characters, and at most two actions. Remove duplicate metric strips from the hero and place them directly below as normal content.

- [ ] **Step 3: Refine `startkit.html` as a numbered workflow**

Keep the five existing steps and all commands. Render steps as a border-separated vertical sequence with oversized `01–05`; keep the full code walkthrough in the dark code surface. Ensure every copy button remains a native `<button>` and the install command can be selected without animation.

- [ ] **Step 4: Refine `leaderboard.html` for dense data**

Keep all four track tables and formal equations. Wrap each table in:

```html
<div class="table-shell" role="region" aria-label="Track 1 leaderboard" tabindex="0">
  <!-- existing leaderboard rows -->
</div>
```

Use sticky headers, tabular numerals, a visible focus ring on the scroll region, and minimum 44 px row height. Move the page’s inline `<style>` rules into `assets/css/landing.css`.

- [ ] **Step 5: Refine `faq.html` as editorial rules and questions**

Render the seven rules as a numbered list with large violet numerals and top borders, not seven floating cards. Render questions as direct heading/body groups with anchor links; do not introduce an accordion because every answer is short enough to scan.

- [ ] **Step 6: Verify technical interactions**

Run:

```bash
python3 scripts/design-check.py --scope shell
python3 scripts/coverage-check.py
```

In a browser, verify copy feedback, leaderboard tabs, MathJax rendering, keyboard table scrolling, mobile menu Escape behavior, and every technical-page internal link.

- [ ] **Step 7: Commit the technical pages**

```bash
git add startkit.html leaderboard.html faq.html assets/css/landing.css
git commit -m "design: refine technical pages for scanning and depth"
```

---

### Task 6: Narrative Secondary Pages and 404

**Files:**
- Modify: `awards.html`
- Modify: `organizers.html`
- Modify: `ethics.html`
- Modify: `track-record.html`
- Modify: `assets/css/landing.css`
- Modify: `assets/css/organizers.css`
- Create: `404.html`

**Interfaces:**
- Consumes: shared shell, page hero, current portraits/logos, and current facts.
- Produces: prize hierarchy, organizer portrait grid, long-form commitments, historical timeline, and a branded dead-end recovery route.

- [ ] **Step 1: Capture baseline screenshots for all four pages**

Use 1440×900 and 390×844. Record any clipped portrait, uneven logo, orphaned heading, or repeated card-layout issue.

- [ ] **Step 2: Make awards numerical and immediate**

Lead with `$2,500` and `top three teams / track`, keep all current eligibility and replay language, and group track awards by shared rules rather than five identical card towers. Link ethics once using the existing `ethics.html` route.

- [ ] **Step 3: Simplify organizer presentation**

Keep all 28 people, existing image paths, proposal order, bios, roles, and affiliations. Use a responsive portrait grid with consistent image aspect ratio, left-aligned names, and affiliations as plain metadata. Remove decorative card shadows; use space and one top border for hierarchy. Keep `organizers.css` below 300 lines and remove rules duplicated in `landing.css`.

- [ ] **Step 4: Give ethics and track record editorial reading layouts**

For `ethics.html`, constrain prose to 65 characters, surface commitments as a numbered list, and retain every consent/controller statement. For `track-record.html`, use one vertical year rail for 2021, 2022, 2023, 2025, and 2026; retain all participation figures and links.

- [ ] **Step 5: Add the branded 404 page**

Create `404.html` with the shared header/footer, metadata, and this main content:

```html
<main class="site-main error-page" id="main">
  <p class="bs-eyebrow">404 · Signal not found</p>
  <h1>This channel is quiet<span class="bs-stop">.</span></h1>
  <p>The page may have moved. Return to the challenge or open the start kit.</p>
  <div class="bs-hero-cta">
    <a class="bs-btn primary" href="index.html">Back to the challenge</a>
    <a class="bs-btn ghost" href="startkit.html">Open the start kit</a>
  </div>
</main>
```

Use the trophy desktop asset as an ambient background with `aria-hidden="true"`; do not load a second dedicated image.

- [ ] **Step 6: Run structure and content gates**

```bash
python3 scripts/design-check.py --scope shell
python3 scripts/coverage-check.py
```

Expected: both PASS. Open `/404.html` locally and confirm both recovery links. After deployment, request one nonexistent path and confirm GitHub Pages serves the custom 404.

- [ ] **Step 7: Commit narrative pages and recovery route**

```bash
git add awards.html organizers.html ethics.html track-record.html 404.html \
  assets/css/landing.css assets/css/organizers.css
git commit -m "design: finish narrative pages and branded 404"
```

---

### Task 7: Metadata, Active Navigation, and Link Integrity

**Files:**
- Modify: all nine HTML files including `404.html`
- Modify: `assets/js/ui.js`
- Modify: `sitemap.xml`
- Modify: `scripts/design-check.py`

**Interfaces:**
- Consumes: final shared shell and identity assets.
- Produces: accurate metadata, active navigation, canonical links, and complete same-site link verification.

- [ ] **Step 1: Run metadata audit and verify remaining failures**

Run: `python3 scripts/design-check.py --scope metadata`

Expected: FAIL until all pages and the new 404 carry complete metadata and the homepage theme color is updated.

- [ ] **Step 2: Align homepage sharing metadata**

Set `<meta name="theme-color" content="#5332F4" />`. Keep the canonical domain `https://neural-interfaces26.github.io/`. Keep the existing factual title and description. Point Open Graph and Twitter images to `https://neural-interfaces26.github.io/assets/img/og-card.png` and set dimensions to 1200×627.

- [ ] **Step 3: Complete per-page metadata**

Every route gets a unique `<title>`, a specific description, viewport, canonical URL, Open Graph title/description/type/url/image, and Twitter card metadata. The 404 uses `robots` content `noindex, follow`.

- [ ] **Step 4: Add active-page navigation without hard-coded duplicates**

In each HTML file, set `aria-current="page"` on its direct route. In `ui.js`, set `aria-current="location"` on homepage anchor links only when their section is the current IntersectionObserver target. Do not overwrite `aria-current="page"`.

- [ ] **Step 5: Extend `design-check.py` with same-site link validation**

For every non-external, non-mailto link:

1. Resolve the path relative to the source page.
2. Treat an empty path as the source page.
3. Verify the target file exists.
4. If a fragment exists, parse the target and verify the fragment is an ID.
5. Report the source page, href, and missing target on failure.

Add this validation to `--scope all`; do not add another script.

- [ ] **Step 6: Run metadata, content, and full design gates**

```bash
python3 scripts/design-check.py --scope metadata
python3 scripts/design-check.py --scope all
python3 scripts/coverage-check.py
```

Expected: all PASS.

- [ ] **Step 7: Commit metadata and navigation**

```bash
git add index.html startkit.html faq.html leaderboard.html awards.html \
  organizers.html ethics.html track-record.html 404.html \
  assets/js/ui.js sitemap.xml scripts/design-check.py
git commit -m "fix: complete metadata navigation and link integrity"
```

---

### Task 8: Visual, Accessibility, Performance, and Browser Verification

**Files:**
- Modify only files implicated by verification findings.
- Create no permanent screenshot artifacts unless the repository already tracks a baseline directory.

**Interfaces:**
- Consumes: completed implementation from Tasks 1–7.
- Produces: a clean working tree whose automated and manual acceptance gates pass.

- [ ] **Step 1: Run all local static checks**

```bash
python3 scripts/design-check.py --scope all
python3 scripts/coverage-check.py
rg -n 'href="#"|style="|height:\s*100vh|vb-sidebar|preview-banner' -- *.html assets/css/*.css
```

Expected: both scripts PASS and `rg` returns no matches.

- [ ] **Step 2: Start a deterministic local server**

Run `./scripts/serve.sh` and confirm every route returns 200. Keep the server session open for screenshots and Lighthouse.

- [ ] **Step 3: Capture the responsive matrix**

Capture all public pages at:

- Desktop: 1440×900
- Tablet portrait: 768×1024
- Mobile: 390×844
- Narrow mobile: 320×568

For the homepage, also capture 1920×1080. Check no text collision, clipped trophy, wrapped desktop CTA, two-line desktop navigation, table-induced page overflow, stretched logo, or stranded one-word heading remains.

Use the installed Chrome binary with this exact matrix:

```bash
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
for page in index startkit faq leaderboard awards organizers ethics track-record 404; do
  for viewport in 1440x900 768x1024 390x844 320x568; do
    width=${viewport%x*}
    height=${viewport#*x}
    "$CHROME" --headless --disable-gpu --hide-scrollbars \
      --window-size="$width,$height" \
      --screenshot="/tmp/neural-${page}-${viewport}.png" \
      "http://127.0.0.1:8000/${page}.html"
  done
done
"$CHROME" --headless --disable-gpu --hide-scrollbars \
  --window-size=1920,1080 \
  --screenshot=/tmp/neural-index-1920x1080.png \
  http://127.0.0.1:8000/index.html
```

- [ ] **Step 4: Perform keyboard and reduced-motion checks**

On `index.html`, `startkit.html`, `leaderboard.html`, and `faq.html`:

1. Tab from the skip link through the header and first section.
2. Open and close the mobile menu with keyboard only.
3. Press Escape and verify focus returns to the menu button.
4. Operate copy buttons and leaderboard tabs.
5. Emulate `prefers-reduced-motion: reduce` and verify content remains visible with no continuous animation.

- [ ] **Step 5: Run Lighthouse on the homepage and heaviest technical page**

```bash
npx -y lighthouse http://127.0.0.1:8000/index.html \
  --chrome-flags='--headless --no-sandbox' \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=/tmp/neural-home-lighthouse.json
npx -y lighthouse http://127.0.0.1:8000/leaderboard.html \
  --chrome-flags='--headless --no-sandbox' \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=/tmp/neural-leaderboard-lighthouse.json
```

Read the four category scores from both JSON files. Homepage must meet `90/95/95/95`; leaderboard must meet `85/95/95/95` because MathJax is an intentional external cost.

- [ ] **Step 6: Verify initial homepage transfer budget**

With an empty cache, sum the homepage HTML, CSS, JS, font, and initially requested image transfer sizes. Expected total: at most 1.8 MB. Confirm lazy track figures and below-fold portraits do not load before scrolling.

- [ ] **Step 7: Smoke-test installed desktop browsers**

Open the homepage, start kit, leaderboard, and organizers pages in Chrome, Firefox, and Safari. Verify header blur fallback, trophy crop, grid collapse, code scrolling, MathJax, and organizer portrait sizing. In Safari responsive mode, verify 390×844 and 320×568.

- [ ] **Step 8: Compare against the approved references**

Invoke `visual-verdict`. Read root `DESIGN.md` first. Use the PSD composite as the identity comparator; the four direct mono-color sheets and source skill as the composition comparator; the Refero Linear/Notion pages as the design-contract comparator; and Virtual Cell Challenge as the finish comparator. Score layout, typography, color, responsive behavior, interactive states, content completeness, and originality with the skill’s published weights. The review passes only at 90/100 or higher and when:

- The trophy is the first visual memory.
- Typography and violet match the PSD.
- Every campaign view has one focal event and one visible release zone.
- UI emphasis follows the violet/ink two-plate model with no accidental third accent.
- Texture reads as restrained print material, not sepia aging or decorative grunge.
- Whitespace, sponsor hierarchy, and section pacing are at the reference level.
- At least four structural choices differ from every supplied poster reference; no source arrangement, line break, label system, or distinctive lettering is traced.
- The result does not copy botanical imagery, serif typography, catalogue UI, product palette, or content from the references.
- Technical depth remains easier to find than in the current site.

If the result scores below 90, apply the concrete mismatches and rescore. Stop after five scored attempts and report the highest score plus unresolved blocker instead of weakening the threshold.

- [ ] **Step 9: Re-run all checks after any verification fixes**

```bash
python3 scripts/design-check.py --scope all
python3 scripts/coverage-check.py
git diff --check
git status --short
```

Expected: both scripts PASS, `git diff --check` is silent, and status lists only intended files.

- [ ] **Step 10: Commit verification fixes**

```bash
git add .gitignore \
  DESIGN.md \
  assets/css/tokens.css assets/css/base.css assets/css/landing.css assets/css/organizers.css \
  assets/js/ui.js assets/img/brand assets/img/og-card.png \
  scripts/export-brand-assets.py scripts/design-check.py \
  index.html startkit.html faq.html leaderboard.html awards.html \
  organizers.html ethics.html track-record.html 404.html sitemap.xml
git commit -m "fix: pass visual accessibility and performance gates"
```

---

## Final Acceptance Checklist

- [ ] PSD source remains local and ignored.
- [ ] Trophy and social assets match the approved PSD and meet byte budgets.
- [ ] Homepage hero fits the initial desktop viewport and its CTA remains visible.
- [ ] All eight existing routes share one header/footer; `404.html` provides recovery.
- [ ] No `.vb-sidebar`, `.preview-banner`, inline style attribute, dead `href`, or `height: 100vh` remains.
- [ ] All current facts, equations, routes, images, biographies, anchor IDs, and email actions remain intact.
- [ ] Design, coverage, same-site link, Lighthouse, keyboard, reduced-motion, responsive, and browser checks pass.
- [ ] The site is recognizably the same visual identity as `Linkedin Post 1.psd` and reaches the reference site’s level of polish without copying it.
