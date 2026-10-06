"""Evaluate a trained model on a dataset folder and write per-class metrics."""
import argparse
import json
from pathlib import Path

import numpy as np
import tensorflow as tf


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--data-dir", type=Path, default=Path("data/plantvillage"))
    p.add_argument("--model-dir", type=Path, default=Path("models"))
    p.add_argument("--image-size", type=int, default=224)
    p.add_argument("--batch-size", type=int, default=32)
    args = p.parse_args()

    names = json.loads((args.model_dir / "class_names.json").read_text())
    model = tf.keras.models.load_model(args.model_dir / "plant_disease_model.keras")
    # Same seed/split as train.py so this is the held-out data, not training data.
    val = tf.keras.utils.image_dataset_from_directory(
        args.data_dir, validation_split=0.2, subset="validation", seed=42,
        image_size=(args.image_size, args.image_size), batch_size=args.batch_size, shuffle=False)
    if val.class_names != names:
        raise SystemExit("Dataset classes do not match class_names.json")

    y_true = np.concatenate([y.numpy() for _, y in val])
    y_pred = np.argmax(model.predict(val, verbose=0), axis=1)
    report = {"overall_accuracy": round(float((y_true == y_pred).mean()), 4), "per_class": {}}
    for i, name in enumerate(names):
        mask = y_true == i
        if mask.any():
            report["per_class"][name] = {"support": int(mask.sum()),
                                         "recall": round(float((y_pred[mask] == i).mean()), 4)}
    (args.model_dir / "evaluation.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
