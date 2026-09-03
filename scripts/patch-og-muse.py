#!/usr/bin/env python3
"""Swap the legacy InteraXon wordmark for the Muse mark in the social card.

`export-brand-assets.py` composites `assets/img/og-card.png` straight out of
artboard 1 of the LinkedIn PSD, and that artboard still carries the InteraXon
wordmark in the sponsor strip. The sponsor asked to be credited as Muse, so the
card is patched here rather than in the PSD: erase the old wordmark against the
flat panel fill, then drop in `assets/img/logos/muse.svg` rasterised to the same
optical weight as the neighbouring aws and Meta Brain marks.

Run it after every `export-brand-assets.py` run, until the PSD itself is
updated:

    python3 scripts/patch-og-muse.py

The wordmark's ink box is asserted before anything is drawn, so a re-exported
card whose strip has moved fails loudly instead of being silently mangled.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CARD = ROOT / "assets" / "img" / "og-card.png"
MARK = ROOT / "assets" / "img" / "logos" / "muse.svg"

# Ink box of the InteraXon wordmark in the 1200x627 card, and the flat panel
# fill behind it. Both measured off the 2026-08-28 export.
OLD_INK = (853, 577, 923, 588)  # left, top, right, bottom (inclusive)
PANEL_FILL = (248, 245, 254)

# Ink height, not box height: muse.svg carries clear space in its viewBox, which
# is trimmed off here. 14px reads at parity with "aws" and "Brain" in the strip.
MARK_INK_HEIGHT = 14
SUPERSAMPLE = 32


def ink_box(card: Image.Image, box: tuple[int, int, int, int], threshold: int = 200):
    """Bounding box of the non-background pixels inside `box`, in card coords."""
    left, top, right, bottom = box
    region = card.convert("RGB").crop((left, top, right + 1, bottom + 1))
    mask = region.convert("L").point(lambda v: 255 if v < threshold else 0)
    found = mask.getbbox()
    if found is None:
        return None
    return (found[0] + left, found[1] + top, found[2] + left - 1, found[3] + top - 1)


def render_mark(ink_height: int) -> Image.Image:
    """Rasterise the Muse SVG so its ink — clear space trimmed — is `ink_height` px.

    Rendered far oversized, trimmed on alpha, then LANCZOS-reduced, so the strokes
    stay clean at the tiny size the sponsor strip needs.
    """
    try:
        png = subprocess.run(
            ["rsvg-convert", "-h", str(ink_height * SUPERSAMPLE), str(MARK)],
            check=True, capture_output=True,
        ).stdout
    except FileNotFoundError:
        sys.exit("rsvg-convert introuvable (brew install librsvg)")
    from io import BytesIO

    big = Image.open(BytesIO(png)).convert("RGBA")
    big = big.crop(big.getchannel("A").getbbox())
    width = round(big.width * ink_height / big.height)
    return big.resize((width, ink_height), Image.Resampling.LANCZOS)


def main() -> None:
    card = Image.open(CARD)
    rgb = card.convert("RGB")

    # Probe box: inside the sponsor panel, wide enough that a shifted wordmark
    # trips the assert instead of slipping through, but clear of the panel
    # edge, whose lavender surround is itself darker than the ink threshold.
    probe = ink_box(rgb, (845, 568, 934, 600))
    if probe != OLD_INK:
        sys.exit(
            f"sponsor strip a bougé: encre trouvée en {probe}, attendue en {OLD_INK}. "
            "Remesurer avant de patcher."
        )

    left, top, right, bottom = OLD_INK
    centre_x = (left + right) // 2
    centre_y = (top + bottom) // 2
    rgb.paste(PANEL_FILL, (left - 5, top - 7, right + 6, bottom + 8))

    mark = render_mark(MARK_INK_HEIGHT)
    rgb.paste(mark, (centre_x - mark.width // 2, centre_y - mark.height // 2), mark)

    # Same quantisation as export-brand-assets.py, so the card stays a 256-colour
    # palette PNG under the 700 KB budget design-check.py enforces.
    rgb.quantize(
        colors=256,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.FLOYDSTEINBERG,
    ).save(CARD, optimize=True, icc_profile=None)
    print(f"og-card.png patché: mark {mark.width}x{mark.height} @ {centre_x},{centre_y}")


if __name__ == "__main__":
    main()
