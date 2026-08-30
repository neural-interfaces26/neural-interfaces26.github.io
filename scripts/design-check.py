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
