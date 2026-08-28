#!/usr/bin/env python3
"""Spec-coverage check for the EEG/EMG Foundation Challenge website.

Verifies that every load-bearing fact from the proposal appears somewhere
in the rendered HTML. Exits 1 if any anchor is missing.

The anchor list below is curated rather than auto-extracted, because the
inventory's tables also contain conflict-category headers, role
descriptions, and other metadata that are documentation, not user-facing
content. We list every fact that should be on the site, by category.

The check is lenient on whitespace and case; it ignores common ASCII
substitutions for diacritics (é → e) so harmless name-formatting drift
does not produce noise.
"""
from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = sorted(ROOT.glob("*.html"))

# Curated anchor list, grouped by category. Add new anchors here when
# new facts ship; do not auto-extract from the inventory because the
# inventory contains documentation-only metadata.
ANCHORS: dict[str, list[str]] = {
    "baseline values (P1)": [
        "84.75", "68.04", "143.30", "25.14",
        "28.13", "58.58", "134.89", "205.42",
    ],
    "headline competition numbers (P1)": [
        "1,197", "8,622", "1,382", "247",
    ],
    "past competition names": [
        "BEETL", "Brain Age Prediction", "Sleep States",
        "EEG Foundation Challenge",
    ],
    "domain disambiguation (P0)": [
        "neural-interfaces26.github.io",
    ],
    "discord url (out-of-band)": [
        "discord.gg/yZv8KqKMpH",
    ],
    "metric naming (P1)": [
        "W-bMAE",
    ],
    "gpu class (P0)": [
        "H100", "H200",
    ],
    "submission infrastructure (P0)": [
        "Codabench",
    ],
    "prize amount (P1)": [
        "$2,500",
    ],
    "previously-missing organizers (P1)": [
        "Christopher Aimone",
        "Thomas Moreau",
        # Joséphine appears with the é diacritic on the site; the
        # normaliser strips it for matching.
        "Josephine Raugel",
    ],
    "ethics terminology": [
        "NeurIPS Code of Ethics",
        "mental privacy",
    ],
    "new pages": [
        "ethics.html",
        "track-record.html",
        "faq.html",
    ],
    # "affinity-group naming" anchors removed: the diversity-grant row was
    # deleted from awards.html (proposal does not commit to affinity-network
    # grants; only travel support per top-3 is in the proposal).
    "internship reinstated (P1)": [
        "internship",
    ],
    "core organizer roster (P1, full first-name forms)": [
        "Bruno Aristimunha",
        "Arnault Caillet",
        "Hubert Banville",
        "Pierre Guetschel",
        # Diacritics get normalised, so the canonical site spelling
        # "Jean-Rémi King" matches the ASCII anchor below.
        "Jean-Remi King",
        "Vinay Jayaram",
        "Ugo Nunes",
        "Simon Kojima",
        "Pauline Dreyer",
        "Raphaelle N. Roy",
        "Fabien Lotte",
        "Maurice Abou Jaoude",
        "Jiansheng Niu",
        "Pranav Mamidanna",
        "Alex Gramfort",
        "Cedric Rommel",
        "Marie-Constance Corsi",
        "Lionel Kusch",
        "Thomas Semah",
        "Seyed Yahya Shirazi",
        "Scott Makeig",
        "Isabelle Guyon",
        "Terrence Sejnowski",
        "Sylvain Chevallier",
        "Arnaud Delorme",
    ],
}


def normalise(text: str) -> str:
    """Lower-case + strip ASCII diacritics for lenient matching."""
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()


def main() -> int:
    if not PAGES:
        print(f"ERROR: no HTML pages found in {ROOT}", file=sys.stderr)
        return 2

    html_blob = normalise("\n".join(p.read_text(encoding="utf-8") for p in PAGES))

    total = sum(len(v) for v in ANCHORS.values())
    misses: list[tuple[str, str]] = []

    for category, items in ANCHORS.items():
        for anchor in items:
            norm_anchor = normalise(anchor)
            # Lenient on whitespace.
            pattern = re.escape(norm_anchor).replace(r"\ ", r"\s+")
            if not re.search(pattern, html_blob):
                misses.append((category, anchor))

    print(f"Pages checked: {len(PAGES)}")
    print(f"Anchors checked: {total} across {len(ANCHORS)} categories")
    if not misses:
        print("OK: every anchor appears on the site.")
        return 0

    print(f"\nMISSING {len(misses)} anchor(s):")
    last_cat = ""
    for category, anchor in misses:
        if category != last_cat:
            print(f"\n  [{category}]")
            last_cat = category
        print(f"    - {anchor}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
