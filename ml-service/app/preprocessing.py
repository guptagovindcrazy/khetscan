"""Image validation and preprocessing shared by inference (and mirrored in training)."""
from io import BytesIO

import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError

ALLOWED_FORMATS = {"JPEG", "PNG"}
MIN_SIDE = 32


class InvalidImageError(ValueError):
    """Raised when the uploaded bytes are not a usable JPEG/PNG image."""


def validate_and_open(data: bytes) -> Image.Image:
    """Verify the bytes are a real JPEG/PNG and return a fully loaded RGB image."""
    if not data:
        raise InvalidImageError("The uploaded file is empty.")
    try:
        with Image.open(BytesIO(data)) as probe:
            probe.verify()
        image = Image.open(BytesIO(data))
        image.load()
    except (UnidentifiedImageError, OSError, SyntaxError) as exc:
        raise InvalidImageError("The file is not a valid image.") from exc

    if image.format not in ALLOWED_FORMATS:
        raise InvalidImageError("Only JPG and PNG images are supported.")
    if min(image.size) < MIN_SIDE:
        raise InvalidImageError(f"Image is too small (minimum {MIN_SIDE}px per side).")
    return image.convert("RGB")


def preprocess_image(data: bytes, size: int = 224) -> np.ndarray:
    """Return a float32 batch of shape (1, size, size, 3) scaled to [0, 1]."""
    image = validate_and_open(data)
    array = np.asarray(image, dtype=np.uint8)
    resized = cv2.resize(array, (size, size), interpolation=cv2.INTER_AREA)
    return np.expand_dims(resized.astype("float32") / 255.0, axis=0)


def image_seed(data: bytes) -> int:
    """Deterministic seed from pixel content so demo predictions are repeatable."""
    thumb = np.asarray(validate_and_open(data).resize((8, 8)), dtype=np.uint32)
    return int(thumb.sum() * 2654435761 % (2**32))
