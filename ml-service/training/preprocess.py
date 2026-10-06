"""Dataset sanity check: removes unreadable images and prints per-class counts.

Expected layout (PlantVillage, one folder per class):
    data/plantvillage/<Class_Name>/*.jpg
"""
import argparse
from pathlib import Path

from PIL import Image

EXTENSIONS = {".jpg", ".jpeg", ".png"}


def clean_dataset(root: Path, delete: bool) -> dict:
    counts, bad = {}, []
    for class_dir in sorted(p for p in root.iterdir() if p.is_dir()):
        good = 0
        for path in class_dir.rglob("*"):
            if path.suffix.lower() not in EXTENSIONS:
                continue
            try:
                with Image.open(path) as img:
                    img.verify()
                good += 1
            except Exception:  # noqa: BLE001 - any failure means the file is unusable
                bad.append(path)
        counts[class_dir.name] = good
    if delete:
        for path in bad:
            path.unlink()
    return {"counts": counts, "corrupt": [str(p) for p in bad]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--data-dir", type=Path, default=Path("data/plantvillage"))
    parser.add_argument("--delete-corrupt", action="store_true")
    args = parser.parse_args()
    report = clean_dataset(args.data_dir, args.delete_corrupt)
    for name, n in report["counts"].items():
        print(f"{n:6d}  {name}")
    print(f"\n{len(report['counts'])} classes, {sum(report['counts'].values())} images, {len(report['corrupt'])} corrupt")
