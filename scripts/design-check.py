from __future__ import annotations

import argparse
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    "index.html", "startkit.html", "faq.html", "leaderboard.html",
    "awards.html", "organizers.html", "ethics.html", "track-record.html",
]
ALL_PAGES = PAGES + ["404.html"]
SITE_ORIGIN = "https://neural-interfaces26.github.io"
OG_IMAGE = f"{SITE_ORIGIN}/assets/img/og-card.png"
UI_SCRIPT = "assets/js/ui.js?v=20260831e"
HOME_DESCRIPTION = (
    "Open-source EEG/EMG decoding benchmark for NeurIPS 2026 in Sydney. "
    "Neural Interfaces for Generalizable Decoding across EEG, EMG, sleep, and BCI tracks. "
    "Submissions Sep 16 - Nov 16, 2026 (AoE)."
)
TOKENS = {
    "--bs-violet": "#5332f4",
    "--bs-text": "#07101f",
    "--bs-surface": "#f7f5fc",
    "--bs-card-border": "#e3dbf4",
}
NARRATIVE_PAGES = ("awards.html", "organizers.html", "ethics.html", "track-record.html")
ORGANIZER_NAMES = (
    "Bruno Aristimunha", "Arnault Caillet", "Hubert Banville", "Pierre Guetschel",
    "Jean-Rémi King", "Vinay Jayaram", "Ugo Nunes", "Simon Kojima",
    "Pauline Dreyer", "Raphaëlle N. Roy", "Fabien Lotte", "Jiansheng Niu",
    "Maurice Abou Jaoude", "Christopher Aimone", "Pranav Mamidanna", "Alex Gramfort",
    "Cédric Rommel", "Marie-Constance Corsi", "Thomas Moreau", "Joséphine Raugel",
    "Lionel Kusch", "Thomas Semah", "Seyed Yahya Shirazi", "Scott Makeig",
    "Isabelle Guyon", "Terrence Sejnowski", "Sylvain Chevallier", "Arnaud Delorme",
)


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.hrefs: list[str] = []
        self.images: list[dict[str, str]] = []
        self.classes: list[str] = []
        self.inline_styles = 0
        self.tags: dict[str, int] = {}
        self.elements: list[dict[str, object]] = []
        self.stack: list[dict[str, object]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key: value or "" for key, value in attrs}
        element: dict[str, object] = {
            "tag": tag,
            "attrs": data,
            "ancestors": tuple(self.stack),
            "text": [],
        }
        self.elements.append(element)
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
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}:
            self.stack.append(element)

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index]["tag"] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data: str) -> None:
        for element in self.stack:
            element["text"].append(data)

    def find(self, tag: str | None = None, class_name: str | None = None) -> list[dict[str, object]]:
        found: list[dict[str, object]] = []
        for element in self.elements:
            attrs = element["attrs"]
            classes = str(attrs.get("class", "")).split()
            if (tag is None or element["tag"] == tag) and (class_name is None or class_name in classes):
                found.append(element)
        return found


def has_ancestor(element: dict[str, object], ancestor: dict[str, object]) -> bool:
    return any(candidate is ancestor for candidate in element["ancestors"])


def element_text(element: dict[str, object]) -> str:
    return " ".join("".join(element["text"]).split())


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
    legacy = (ROOT / "assets/css/landing.css").read_text(encoding="utf-8").lower()
    if re.search(r"rgba\((?:107,\s*58,\s*240|91,\s*46,\s*229)|#(?:5b2ee5|6b3af0)|rgba\((?:0,\s*54,\s*159|238,\s*95,\s*91|204,\s*73,\s*0|126,\s*63,\s*152)", legacy):
        errors.append("tokens: legacy third-accent UI colors remain")
    for page in ("index.html", "faq.html", "leaderboard.html", "startkit.html"):
        if "%235332f4" not in (ROOT / page).read_text(encoding="utf-8").lower():
            errors.append(f"{page}: favicon must use exact #5332F4")


def strip_css_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)


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
        for match in re.finditer(r"font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px", css):
            if float(match.group(1)) < 10:
                line = css.count("\n", 0, match.start()) + 1
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
    if re.search(
        r"\.phase-card \.phase-(?:tag(?: \.badge)?|date)(?:\s*,[^{}]+)?\s*\{[^}]*font-family\s*:\s*var\(--bs-fontsans\)",
        landing,
    ):
        errors.append("assets/css/landing.css: phase metadata must retain IBM Plex Mono")

    required_detail_selectors = (
        ".site-menu > a:not(.bs-btn)::after",
        ".local-nav a::after",
        ".page-proof > div:first-child",
        ".vb-tracks-meta > div:first-child",
    )
    for selector in required_detail_selectors:
        if selector not in styles["assets/css/landing.css"]:
            errors.append(f"assets/css/landing.css: missing shared detail selector {selector}")

    seal_path = ROOT / "assets/img/brand/trophy-seal.webp"
    if not seal_path.exists():
        errors.append("assets/img/brand/trophy-seal.webp: missing exported pedestal seal")

    for page in ALL_PAGES:
        html = (ROOT / page).read_text(encoding="utf-8")
        if "∿" in html:
            errors.append(f"{page}: placeholder header glyph remains")
        if html.count('class="site-brand-mark"') != 1:
            errors.append(f"{page}: requires exactly one shared site-brand-mark")
        if html.count('src="assets/img/brand/trophy-seal.webp"') != 1:
            errors.append(f"{page}: requires exactly one pedestal-seal asset")

    if any(parse_page(name)[1].find(class_name="announcement-strip") for name in NARRATIVE_PAGES):
        scoped_announcement = (
            r"\.narrative-page\s+\.announcement-strip\s*\{[^}]*display\s*:\s*flex",
            r"\.narrative-page\s+\.announcement-strip\s+p\s*\{[^}]*max-width",
            r"\.narrative-page\s+\.announcement-label\s*\{[^}]*text-transform\s*:\s*uppercase",
            r"\.narrative-page\s+\.announcement-strip\s*\{[^}]*align-items\s*:\s*flex-start[^}]*justify-content\s*:\s*flex-start",
        )
        if not all(re.search(pattern, landing) for pattern in scoped_announcement):
            errors.append("assets/css/landing.css: unmigrated narrative announcements require scoped presentation")
        if re.search(r"(?m)^\s*\.page-hero-inner\s*\{[^}]*(?:display\s*:\s*grid|grid-template-columns\s*:)", landing):
            errors.append("assets/css/landing.css: technical hero grid must not apply to unmigrated narrative heroes")


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

        shell = parsed.find("header") + parsed.find("footer")
        route = "index.html" if page == "index.html" else page
        direct_links = [
            link for link in parsed.find("a")
            if link["attrs"].get("href") == route
            and any(has_ancestor(link, container) for container in shell)
        ]
        for link in direct_links:
            if link["attrs"].get("aria-current") != "page":
                errors.append(f"{page}: shell link {route!r} must use aria-current='page'")
        for link in parsed.find("a"):
            current = link["attrs"].get("aria-current")
            href = str(link["attrs"].get("href", ""))
            if current == "page" and (href != route or link not in direct_links):
                errors.append(f"{page}: aria-current='page' is invalid on href {href!r}")
            if current == "location":
                errors.append(f"{page}: aria-current='location' must be set dynamically")


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


def check_technical(errors: list[str]) -> None:
    pages = {name: parse_page(name)[1] for name in ("startkit.html", "leaderboard.html", "faq.html")}
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
    for name, parsed in pages.items():
        text = (ROOT / name).read_text(encoding="utf-8")
        if not re.search(r'<meta\s+name="theme-color"\s+content="#5332f4"\s*/?>', text, re.IGNORECASE):
            errors.append(f"{name}: theme-color must use the approved violet")
        heroes = parsed.find("section", "page-hero")
        if len(heroes) != 1:
            errors.append(f"{name}: requires one compact page hero")
        elif len([h1 for h1 in parsed.find("h1") if has_ancestor(h1, heroes[0])]) != 1:
            errors.append(f"{name}: page hero requires one h1")
        eyebrows = parsed.find(class_name="bs-eyebrow")
        if len(eyebrows) != 1 or not heroes or not has_ancestor(eyebrows[0], heroes[0]):
            errors.append(f"{name}: keep exactly one eyebrow in the page hero")
        if parsed.find(class_name="dot"):
            errors.append(f"{name}: decorative pulsing dots are not allowed on technical pages")
        if len(parsed.find("nav", "local-nav")) != 1:
            errors.append(f"{name}: requires one local navigation")

    leaderboard = pages["leaderboard.html"]
    tables = leaderboard.find("table", "leaderboard-table")
    if len(tables) != 4:
        errors.append("leaderboard.html: requires four native leaderboard tables")
    for number, table in enumerate(tables, start=1):
        shells = [shell for shell in leaderboard.find("div", "table-shell") if has_ancestor(table, shell)]
        attrs = shells[0]["attrs"] if len(shells) == 1 else {}
        if len(shells) != 1 or attrs.get("role") != "region" or not attrs.get("aria-label") or attrs.get("tabindex") != "0":
            errors.append(f"leaderboard.html: table {number} requires one labelled keyboard scroller")
        for tag in ("caption", "thead", "tbody"):
            if not any(has_ancestor(element, table) for element in leaderboard.find(tag)):
                errors.append(f"leaderboard.html: table {number} missing {tag}")
        headers = [header for header in leaderboard.find("th") if has_ancestor(header, table)]
        scopes = {header["attrs"].get("scope") for header in headers}
        if not {"col", "row"}.issubset(scopes):
            errors.append(f"leaderboard.html: table {number} requires row and column headers")
        if "not ranked" not in element_text(table).lower():
            errors.append(f"leaderboard.html: table {number} requires an explicit not ranked state")

    methodology = [
        element for element in leaderboard.elements
        if element["tag"] == "section" and element["attrs"].get("id") == "methodology"
    ]
    methodology_lists = [
        element for element in leaderboard.find("ol", "methodology-list")
        if methodology and has_ancestor(element, methodology[0])
    ]
    methodology_items = [
        element for element in leaderboard.find("li", "methodology-item")
        if methodology_lists and has_ancestor(element, methodology_lists[0])
    ]
    if len(methodology) != 1 or len(methodology_lists) != 1 or len(methodology_items) != 3:
        errors.append("leaderboard.html: methodology requires one open three-step list")

    startkit = pages["startkit.html"]
    contracts = startkit.find("table", "track-contract")
    if len(contracts) != 1:
        errors.append("startkit.html: requires one native four-track contract")
    else:
        contract = contracts[0]
        rows = [row for row in startkit.find("tr") if has_ancestor(row, contract)]
        body_rows = [row for row in rows if any(a["tag"] == "tbody" for a in row["ancestors"])]
        headers = {element_text(header).lower() for header in startkit.find("th") if has_ancestor(header, contract)}
        required = {"track", "input", "held-out shift", "output", "metric", "baseline", "release state"}
        if len(body_rows) != 4:
            errors.append("startkit.html: track contract requires four body rows")
        if not required.issubset(headers):
            errors.append("startkit.html: track contract is missing required fields")
        shells = [shell for shell in startkit.find("div", "table-shell") if has_ancestor(contract, shell)]
        if len(shells) != 1 or not shells[0]["attrs"].get("aria-label") or shells[0]["attrs"].get("tabindex") != "0":
            errors.append("startkit.html: track contract requires one labelled keyboard scroller")

    faq = pages["faq.html"]
    details = faq.find("details", "faq-item")
    if len(details) != 4:
        errors.append("faq.html: optional questions require four native disclosures")
    for number, disclosure in enumerate(details, start=1):
        if not any(has_ancestor(summary, disclosure) for summary in faq.find("summary")):
            errors.append(f"faq.html: disclosure {number} missing summary")
    rules = faq.find("li", "vb-rule")
    if len(rules) != 7 or any(any(a["tag"] == "details" for a in rule["ancestors"]) for rule in rules):
        errors.append("faq.html: all seven binding rules must remain visible")

    for name, parsed in pages.items():
        if any(button["tag"] != "button" for button in parsed.find(class_name="copy")):
            errors.append(f"{name}: copy controls must use native buttons")


def check_narrative(errors: list[str]) -> None:
    pages = {name: parse_page(name) for name in NARRATIVE_PAGES}
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
    for name, (text, parsed) in pages.items():
        if "narrative-page" not in parsed.classes:
            errors.append(f"{name}: narrative page class missing")
        heroes = parsed.find("section", "page-hero")
        if len(heroes) != 1:
            errors.append(f"{name}: requires one compact page hero")
        elif len([h1 for h1 in parsed.find("h1") if has_ancestor(h1, heroes[0])]) != 1:
            errors.append(f"{name}: page hero requires one h1")
        if "—" in text or "–" in text:
            errors.append(f"{name}: visible copy must use regular hyphens")

    awards = pages["awards.html"][1]
    if len(awards.find(class_name="award-total")) != 1 or "$30,000" not in element_text(awards.find(class_name="award-total")[0]):
        errors.append("awards.html: requires one dominant $30,000 total")
    if len(awards.find(class_name="award-breakdown")) != 1:
        errors.append("awards.html: requires one ruled award breakdown")
    if len(awards.find(class_name="award-track")) != 4:
        errors.append("awards.html: requires four track award rows")
    if len(awards.find(class_name="award-eligibility")) != 1:
        errors.append("awards.html: requires one eligibility caveat")
    awards_main = awards.find("main")
    ethics_links = [
        link for link in awards.find("a")
        if link["attrs"].get("href") == "ethics.html" and awards_main and has_ancestor(link, awards_main[0])
    ]
    if len(ethics_links) != 1:
        errors.append("awards.html: main content must link the ethics route once")

    organizers_text, organizers = pages["organizers.html"]
    people = organizers.find("article", "org-card")
    if len(people) != 28:
        errors.append("organizers.html: requires all 28 organizers")
    if tuple(element_text(name) for name in organizers.find(class_name="name")) != ORGANIZER_NAMES:
        errors.append("organizers.html: organizer proposal order changed")
    for person in people:
        for field in ("avatar", "name", "role", "bio", "affil"):
            if not any(has_ancestor(item, person) for item in organizers.find(class_name=field)):
                errors.append(f"organizers.html: organizer missing {field}")
                break
    if len(organizers.find(class_name="org-directory")) != 1:
        errors.append("organizers.html: requires one ruled portrait directory")
    if len(organizers.find(class_name="org-institutions")) != 1:
        errors.append("organizers.html: institutional marks require a separate stage")
    person_affiliations = [
        affiliation for affiliation in organizers.find(class_name="affil")
        if any(has_ancestor(affiliation, person) for person in people)
    ]
    affiliation_images = [
        image for image in organizers.find("img")
        if any(has_ancestor(image, affiliation) for affiliation in person_affiliations)
    ]
    if affiliation_images:
        errors.append("organizers.html: person affiliations must be plain text without images")
    institution_stages = organizers.find(class_name="org-logo-stage")
    institution_marks = [
        image for image in organizers.find("img")
        if institution_stages and has_ancestor(image, institution_stages[0])
    ]
    institution_copy = element_text(organizers.find(class_name="org-institutions")[0]) if organizers.find(class_name="org-institutions") else ""
    if len(institution_marks) != 18 or "14 organizer institutions" not in institution_copy or "18 affiliation marks" not in institution_copy:
        errors.append("organizers.html: institution stage must distinguish 14 institutions from 18 affiliation marks")
    if organizers_text.count('loading="lazy"') < 28:
        errors.append("organizers.html: all portraits must lazy-load")
    if len((ROOT / "assets/css/organizers.css").read_text(encoding="utf-8").splitlines()) >= 300:
        errors.append("assets/css/organizers.css: must stay below 300 lines")

    ethics = pages["ethics.html"][1]
    if len(ethics.find("nav", "local-nav")) != 1:
        errors.append("ethics.html: requires one local section index")
    if len(ethics.find(class_name="editorial-lane")) != 1:
        errors.append("ethics.html: requires one editorial reading lane")
    ethics_main = ethics.find("main")
    ethics_copy = element_text(ethics_main[0]) if ethics_main else ""
    ethics_facts = (
        "Non-invasive neural decoding has clinical value, but raises a mental-privacy concern when applied to non-consenting subjects.",
        "Every human-subject dataset comes from its original data controller.",
        "Every participant in every dataset has provided explicit consent.",
        "All decoders in this competition are read-only.",
    )
    for fact in ethics_facts:
        if fact not in ethics_copy:
            errors.append(f"ethics.html: preserved fact missing: {fact}")
    commitments = ethics.find("ol", "commitment-list")
    if len(commitments) != 1 or len([item for item in ethics.find("li") if has_ancestor(item, commitments[0])]) != 3:
        errors.append("ethics.html: requires three numbered ruled commitments")

    record = pages["track-record.html"][1]
    rails = record.find(class_name="year-rail")
    entries = record.find(class_name="year-entry")
    if len(rails) != 1 or len(entries) != 5:
        errors.append("track-record.html: requires one five-entry year rail")
    if len(record.find(class_name="evidence-header")) != 5:
        errors.append("track-record.html: each year requires an evidence header")
    evidence_self_links = [
        link for link in record.find("a")
        if str(link["attrs"].get("href", "")).startswith("#")
        and any(has_ancestor(link, header) for header in record.find(class_name="evidence-header"))
    ]
    if evidence_self_links:
        errors.append("track-record.html: evidence headers must not present local headings as sources")
    rail_text = element_text(rails[0]) if rails else ""
    for year in ("2021", "2022", "2023", "2025", "2026"):
        if year not in rail_text:
            errors.append(f"track-record.html: missing {year} from year rail")

    error_text, error_page = parse_page("404.html") if (ROOT / "404.html").is_file() else ("", PageParser())
    if error_page.tags.get("header") != 1 or error_page.tags.get("main") != 1 or error_page.tags.get("footer") != 1:
        errors.append("404.html: requires the shared shell")
    for destination in ('href="index.html"', 'href="startkit.html"', 'href="faq.html"', 'href="mailto:neurips2026-eeg-emg-competition@googlegroups.com"'):
        if destination not in error_text:
            errors.append(f"404.html: missing recovery destination {destination}")
    trophies = error_page.find(class_name="error-trophy")
    if len(trophies) != 1 or trophies[0]["attrs"].get("aria-hidden") != "true":
        errors.append("404.html: requires one decorative trophy field")


def check_metadata(errors: list[str]) -> None:
    titles: dict[str, str] = {}
    descriptions: dict[str, str] = {}

    def one_attr(
        page: str,
        parsed: PageParser,
        tag: str,
        selector: str,
        value: str,
        attr: str = "content",
    ) -> str:
        matches = [element for element in parsed.find(tag) if element["attrs"].get(selector) == value]
        if len(matches) != 1:
            errors.append(f"{page}: requires one {tag}[{selector}={value!r}]")
            return ""
        return str(matches[0]["attrs"].get(attr, ""))

    for page in ALL_PAGES:
        _, parsed = parse_page(page)
        page_titles = parsed.find("title")
        if len(page_titles) != 1 or not element_text(page_titles[0]):
            errors.append(f"{page}: requires one non-empty title")
            title = ""
        else:
            title = element_text(page_titles[0])
            titles[page] = title

        description = one_attr(page, parsed, "meta", "name", "description")
        if description:
            descriptions[page] = description
            if page == "index.html" and description != HOME_DESCRIPTION:
                errors.append(f"{page}: description must preserve the existing factual homepage copy")
            elif page != "index.html" and not 120 <= len(description) <= 160:
                errors.append(f"{page}: description must be 120-160 characters (found {len(description)})")

        if not one_attr(page, parsed, "meta", "name", "viewport"):
            errors.append(f"{page}: viewport content must not be empty")
        if one_attr(page, parsed, "meta", "name", "theme-color") != "#5332F4":
            errors.append(f"{page}: theme-color must be #5332F4")

        expected_url = f"{SITE_ORIGIN}/{'' if page == 'index.html' else page}"
        canonicals = [
            element for element in parsed.find("link")
            if "canonical" in str(element["attrs"].get("rel", "")).split()
        ]
        if page == "404.html":
            if canonicals:
                errors.append("404.html: canonical must be omitted")
            if one_attr(page, parsed, "meta", "name", "robots") != "noindex, follow":
                errors.append("404.html: robots must be exactly 'noindex, follow'")
            if any(
                script["attrs"].get("type") == "application/ld+json"
                for script in parsed.find("script")
            ):
                errors.append("404.html: structured data must be omitted")
        elif len(canonicals) != 1 or canonicals[0]["attrs"].get("href") != expected_url:
            errors.append(f"{page}: canonical must be {expected_url}")

        og = {
            name: one_attr(page, parsed, "meta", "property", name)
            for name in (
                "og:title", "og:description", "og:type", "og:url", "og:image",
                "og:image:width", "og:image:height", "og:image:alt",
            )
        }
        twitter = {
            name: one_attr(page, parsed, "meta", "name", name)
            for name in ("twitter:card", "twitter:title", "twitter:description", "twitter:image")
        }
        expected_social = {
            "og:title": title,
            "og:description": description,
            "og:url": expected_url,
            "og:image": OG_IMAGE,
            "og:image:width": "1200",
            "og:image:height": "627",
            "twitter:card": "summary_large_image",
            "twitter:title": title,
            "twitter:description": description,
            "twitter:image": OG_IMAGE,
        }
        for name, expected in expected_social.items():
            actual = og.get(name, twitter.get(name, ""))
            if actual != expected:
                errors.append(f"{page}: {name} must be {expected!r}")
        if not og["og:type"]:
            errors.append(f"{page}: og:type must not be empty")
        if len(og["og:image:alt"].split()) < 6:
            errors.append(f"{page}: og:image:alt must describe the social image")

        if any(
            script["attrs"].get("type") == "application/ld+json"
            for script in parsed.find("script")
        ):
            errors.append(f"{page}: unsupported structured data must be omitted")

    if len(set(titles.values())) != len(ALL_PAGES):
        errors.append("metadata: every route must have a unique title")
    if len(set(descriptions.values())) != len(ALL_PAGES):
        errors.append("metadata: every route must have a unique description")

    sitemap = ET.parse(ROOT / "sitemap.xml").getroot()
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_urls = [element.text or "" for element in sitemap.findall("sm:url/sm:loc", namespace)]
    expected_urls = [f"{SITE_ORIGIN}/{'' if page == 'index.html' else page}" for page in PAGES]
    if sitemap_urls != expected_urls:
        errors.append(f"sitemap.xml: routes must be exactly {expected_urls!r}")

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    if "User-agent: *\nAllow: /" not in robots:
        errors.append("robots.txt: crawling must remain permissive")
    if f"Sitemap: {SITE_ORIGIN}/sitemap.xml" not in robots:
        errors.append("robots.txt: sitemap URL is incorrect")


def resolve_same_site_href(source: str, href: str) -> tuple[Path, str, str] | None:
    source_url = urljoin(f"{SITE_ORIGIN}/", source)
    url = urlsplit(urljoin(source_url, href))
    scheme = url.scheme.lower()
    if scheme not in {"http", "https"} or not url.hostname:
        return None

    try:
        port = url.port
        site = urlsplit(SITE_ORIGIN)
        site_port = site.port
    except ValueError:
        return None
    effective_port = port or (443 if scheme == "https" else 80)
    site_scheme = site.scheme.lower()
    site_effective_port = site_port or (443 if site_scheme == "https" else 80)
    if (scheme, url.hostname.lower(), effective_port) != (
        site_scheme,
        str(site.hostname).lower(),
        site_effective_port,
    ):
        return None

    decoded_path = unquote(url.path or "/").replace("\\", "/")
    relative = decoded_path.lstrip("/")
    if decoded_path.endswith("/"):
        relative += "index.html"
    target = (ROOT / relative).resolve()
    target_name = target.relative_to(ROOT.resolve()).as_posix()
    return target, target_name, unquote(url.fragment)


def check_links(errors: list[str]) -> None:
    parsed_pages = {page: parse_page(page)[1] for page in ALL_PAGES}
    target_pages = parsed_pages.copy()

    regression_cases = (
        ("index.html", "faq.html?from=home#rule%2Ddata", ("faq.html", "rule-data")),
        ("index.html", "?preview=1#main", ("index.html", "main")),
        ("faq.html", f"{SITE_ORIGIN}?preview=1#tracks", ("index.html", "tracks")),
        ("index.html", "leaderboard%2Ehtml#track%2D1", ("leaderboard.html", "track-1")),
        ("index.html", ".", ("index.html", "")),
        ("index.html", "./", ("index.html", "")),
        ("faq.html", "/", ("index.html", "")),
        ("index.html", f"{SITE_ORIGIN}/faq.html#rules", ("faq.html", "rules")),
        (
            "index.html",
            "https://neural-interfaces26.github.io:443/faq.html#rules",
            ("faq.html", "rules"),
        ),
        ("index.html", "https://neural-interfaces26.github.io:444/faq.html", None),
        ("index.html", "http://neural-interfaces26.github.io/faq.html", None),
    )
    for source, href, expected in regression_cases:
        resolved = resolve_same_site_href(source, href)
        actual = (resolved[1], resolved[2]) if resolved else None
        if actual != expected:
            errors.append(f"links: regression case {href!r} resolved to {actual!r}, expected {expected!r}")
    try:
        resolve_same_site_href("index.html", "%2e%2e/outside.html")
    except ValueError:
        pass
    else:
        errors.append("links: encoded path traversal must be rejected")

    for source, parsed in parsed_pages.items():
        for href in parsed.hrefs:
            try:
                resolved = resolve_same_site_href(source, href)
            except ValueError:
                errors.append(f"{source}: href {href!r} resolves outside the repository")
                continue
            if resolved is None:
                continue
            target, target_name, fragment = resolved
            if not target.is_file():
                errors.append(f"{source}: href {href!r} targets missing file {target_name}")
                continue

            if fragment:
                target_page = target_pages.get(target_name)
                if target_page is None and target.suffix.lower() == ".html":
                    _, target_page = parse_page(target_name)
                    target_pages[target_name] = target_page
                if target_page is None or fragment not in target_page.ids:
                    errors.append(f"{source}: href {href!r} targets missing fragment #{fragment} in {target_name}")


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
    for page in ALL_PAGES:
        _, parsed = parse_page(page)
        ui_scripts = [
            str(element["attrs"].get("src", ""))
            for element in parsed.find("script")
            if "assets/js/ui.js" in str(element["attrs"].get("src", ""))
        ]
        if ui_scripts != [UI_SCRIPT]:
            errors.append(f"{page}: requires exactly {UI_SCRIPT}, found {ui_scripts!r}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--scope",
        choices=("tokens", "detail", "shell", "home", "technical", "narrative", "metadata", "assets", "all"),
        default="all",
    )
    scope = parser.parse_args().scope
    errors: list[str] = []
    checks = {
        "tokens": check_tokens,
        "detail": check_detail_css,
        "shell": check_shell,
        "home": check_home,
        "technical": check_technical,
        "narrative": check_narrative,
        "metadata": check_metadata,
        "assets": check_assets,
    }
    selected = [*checks.values(), check_links] if scope == "all" else [checks[scope]]
    for check in selected:
        check(errors)
    if errors:
        print("\n".join(f"FAIL: {error}" for error in errors))
        return 1
    print(f"PASS: design checks ({scope})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
