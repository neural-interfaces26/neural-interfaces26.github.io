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
    social.convert("RGB").quantize(
        colors=256,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.FLOYDSTEINBERG,
    ).save(root / "assets" / "img" / "og-card.png", optimize=True, icc_profile=None)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    export(args.source, args.root)


if __name__ == "__main__":
    main()
