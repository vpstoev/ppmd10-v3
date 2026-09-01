"""Create conservative display-size derivatives for very small portraits.

This deliberately does not invent facial detail. It only performs a
high-quality resize, tiny tonal correction and restrained output sharpening,
then saves efficient WebP siblings for the website's larger editorial frame.
"""

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]

SOURCES = [
    "public/people/department-head.jpg",
    "public/people/process-procedures-management/Desislava-Mihalova_Team-Leader.jpg",
    "public/people/process-procedures-management/Anna Ilieva.jpg",
    "public/people/process-procedures-management/Tatyana Stoyneva.jpg",
    "public/people/process-procedures-management/Galina Gekova.jpg",
    "public/people/process-procedures-management/Elitsa Tsvetanova.jpg",
    "public/people/process-procedures-management/Kameliya Dakova.jpg",
    "public/people/process-procedures-management/Mariya Grigorova.jpg",
    "public/people/process-procedures-management/Simona-Yordanova_Senior-Specialist.jpg",
    "public/people/process-procedures-management/Bozhidara-Stoilova_Senior-Specialist.jpg",
    "public/people/process-procedures-management/Adelina-Dotseva_Senior-Specialist.jpg",
    "public/people/process-procedures-management/Mariela-Ilieva_Specialist.jpg",
    "public/people/bpt-testing/Ivan-Rumenov_Team-Leader.jpeg",
    "public/people/bpt-testing/Kaloyan-Dzhokin_Expert.jpeg",
    "public/people/bpt-testing/Luka-Tsekov_Senior-Specialist.jpg",
    "public/people/bpt-testing/Mariya-Tudakova_Senior-Specialist.jpg",
    "public/people/bpt-testing/Martin-Chalev_Specialist.jpg",
    "public/people/bpt-testing/Nadezhda-Peycheva_Senior-Specialist.jpg",
    "public/people/bpt-testing/Stoil-Mortev_Senior-Specialist.jpg",
]


def output_path(source: Path) -> Path:
    safe_stem = source.stem.replace(" ", "-")
    return source.with_name(f"{safe_stem}-enhanced.webp")


def enhance(relative_path: str) -> tuple[Path, tuple[int, int], tuple[int, int]]:
    source = ROOT / relative_path
    target = output_path(source)
    with Image.open(source) as original:
        image = original.convert("RGB")
        before = image.size
        target_height = 900 if abs(image.width - image.height) < image.height * 0.12 else 1000
        scale = target_height / image.height
        target_size = (max(1, round(image.width * scale)), target_height)
        image = image.resize(target_size, Image.Resampling.LANCZOS)
        image = ImageEnhance.Contrast(image).enhance(1.035)
        image = ImageEnhance.Color(image).enhance(1.02)
        image = image.filter(ImageFilter.UnsharpMask(radius=1.15, percent=72, threshold=3))
        image.save(target, "WEBP", quality=92, method=6)
    return target, before, target_size


if __name__ == "__main__":
    for item in SOURCES:
        path, before, after = enhance(item)
        print(f"{path.relative_to(ROOT)}: {before[0]}x{before[1]} -> {after[0]}x{after[1]}")
