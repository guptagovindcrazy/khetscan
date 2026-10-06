"""Train a MobileNetV2 transfer-learning classifier on a folder-per-class dataset.

Outputs (in --output-dir): plant_disease_model.keras, class_names.json, metrics.json.
metrics.json holds the validation accuracy actually measured on the held-out split.
"""
import argparse
import json
from pathlib import Path

import tensorflow as tf

SEED = 42


def build_datasets(data_dir: Path, size: int, batch: int):
    common = dict(validation_split=0.2, seed=SEED, image_size=(size, size), batch_size=batch)
    train = tf.keras.utils.image_dataset_from_directory(data_dir, subset="training", **common)
    val = tf.keras.utils.image_dataset_from_directory(data_dir, subset="validation", **common)
    names = train.class_names
    autotune = tf.data.AUTOTUNE
    return train.prefetch(autotune), val.prefetch(autotune), names


def build_model(num_classes: int, size: int) -> tf.keras.Model:
    augment = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.15),
        tf.keras.layers.RandomZoom(0.15),
        tf.keras.layers.RandomContrast(0.1),
    ], name="augmentation")
    base = tf.keras.applications.MobileNetV2(input_shape=(size, size, 3), include_top=False, weights="imagenet")
    base.trainable = False
    inputs = tf.keras.Input(shape=(size, size, 3))  # raw 0-255 pixels from the dataset loader
    x = tf.keras.layers.Rescaling(1 / 255.0)(inputs)  # same [0,1] scaling as app/preprocessing.py
    x = augment(x)
    x = tf.keras.layers.Rescaling(2.0, offset=-1.0)(x)  # MobileNetV2 expects [-1, 1]
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
    return tf.keras.Model(inputs, outputs)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--data-dir", type=Path, default=Path("data/plantvillage"))
    p.add_argument("--output-dir", type=Path, default=Path("models"))
    p.add_argument("--image-size", type=int, default=224)
    p.add_argument("--batch-size", type=int, default=32)
    p.add_argument("--epochs", type=int, default=8, help="head-training epochs")
    p.add_argument("--fine-tune-epochs", type=int, default=5)
    args = p.parse_args()

    tf.keras.utils.set_random_seed(SEED)
    train, val, names = build_datasets(args.data_dir, args.image_size, args.batch_size)
    model = build_model(len(names), args.image_size)
    callbacks = [tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True, monitor="val_accuracy")]

    model.compile(tf.keras.optimizers.Adam(1e-3), "sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(train, validation_data=val, epochs=args.epochs, callbacks=callbacks)

    base = next(layer for layer in model.layers if layer.name.startswith("mobilenetv2"))
    base.trainable = True
    for layer in base.layers[:-30]:
        layer.trainable = False
    model.compile(tf.keras.optimizers.Adam(1e-5), "sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(train, validation_data=val, epochs=args.fine_tune_epochs, callbacks=callbacks)

    loss, acc = model.evaluate(val, verbose=0)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    model.save(args.output_dir / "plant_disease_model.keras")
    (args.output_dir / "class_names.json").write_text(json.dumps(names, indent=2))
    (args.output_dir / "metrics.json").write_text(json.dumps(
        {"val_accuracy": round(float(acc), 4), "val_loss": round(float(loss), 4), "classes": len(names),
         "note": "Measured on a random 20% hold-out split of the provided dataset."}, indent=2))
    print(f"Validation accuracy: {acc:.4f} (saved to {args.output_dir})")


if __name__ == "__main__":
    main()
