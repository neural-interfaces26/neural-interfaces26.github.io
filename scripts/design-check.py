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


def check_technical(errors: list[str]) -> None:
    pages = {name: parse_page(name)[1] for name in ("startkit.html", "leaderboard.html", "faq.html")}
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
        choices=("tokens", "shell", "home", "technical", "metadata", "assets", "all"),
        default="all",
    )
    scope = parser.parse_args().scope
    errors: list[str] = []
    checks = {
        "tokens": check_tokens,
        "shell": check_shell,
        "home": check_home,
        "technical": check_technical,
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
