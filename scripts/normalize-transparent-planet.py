"""Normalize a generated transparent planet to the website composition."""

import argparse
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--orb", type=int, default=430, help="Target high-alpha orb diameter")
    parser.add_argument("--center-x", type=int, default=876)
    parser.add_argument("--center-y", type=int, default=614)
    args = parser.parse_args()

    image = Image.open(args.source).convert("RGBA")
    alpha = image.getchannel("A")
    solid = alpha.point(lambda value: 255 if value >= 248 else 0).getbbox()
    if solid is None:
        raise ValueError("No high-alpha planet body found")

    solid_width = solid[2] - solid[0]
    solid_height = solid[3] - solid[1]
    scale = args.orb / max(solid_width, solid_height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )

    solid_center_x = ((solid[0] + solid[2]) / 2) * scale
    solid_center_y = ((solid[1] + solid[3]) / 2) * scale
    offset = (
        round(args.center_x - solid_center_x),
        round(args.center_y - solid_center_y),
    )

    canvas = Image.new("RGBA", image.size, (0, 0, 0, 0))
    canvas.alpha_composite(resized, dest=offset)
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(args.destination, "PNG", optimize=True)


if __name__ == "__main__":
    main()
