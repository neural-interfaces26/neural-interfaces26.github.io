#!/usr/bin/env python3
"""Encode browser-captured PNG frames as a compact, high-quality GIF."""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from PIL import Image


def build_palette(frames: list[Path]) -> Image.Image:
    sample_count = min(24, len(frames))
    sample_indices = {
        round(index * (len(frames) - 1) / max(sample_count - 1, 1))
        for index in range(sample_count)
    }
    samples = []
    for index in sorted(sample_indices):
        with Image.open(frames[index]) as image:
            sample = image.convert("RGB")
            sample.thumbnail((480, 225), Image.Resampling.LANCZOS)
            samples.append(sample.copy())

    width = max(image.width for image in samples)
    height = sum(image.height for image in samples)
    sheet = Image.new("RGB", (width, height), "white")
    top = 0
    for image in samples:
        sheet.paste(image, (0, top))
        top += image.height
    return sheet.quantize(colors=256, method=Image.Quantize.MEDIANCUT)


def frame_durations(frame_count: int, duration_ms: int) -> list[int]:
    total_centiseconds = round(duration_ms / 10)
    boundaries = [round(index * total_centiseconds / frame_count) for index in range(frame_count + 1)]
    return [(boundaries[index + 1] - boundaries[index]) * 10 for index in range(frame_count)]


def encode(frame_dir: Path, destination: Path, duration_ms: int) -> None:
    frames = sorted(frame_dir.glob("*.png"))
    if not frames:
        raise RuntimeError(f"No PNG frames found in {frame_dir}")

    palette = build_palette(frames)
    encoded = []
    for frame in frames:
        with Image.open(frame) as image:
            rgb = image.convert("RGB")
            encoded.append(
                rgb.quantize(
                    palette=palette,
                    dither=Image.Dither.NONE,
                )
            )

    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(".gif.tmp")
    encoded[0].save(
        temporary,
        format="GIF",
        save_all=True,
        append_images=encoded[1:],
        duration=frame_durations(len(encoded), duration_ms),
        loop=0,
        disposal=1,
        optimize=True,
    )
    os.replace(temporary, destination)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("frame_dir", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--duration-ms", type=int, required=True)
    args = parser.parse_args()
    encode(args.frame_dir, args.destination, args.duration_ms)


if __name__ == "__main__":
    main()
