import numpy as np
import pytest

from app.preprocessing import InvalidImageError, image_seed, preprocess_image, validate_and_open
from tests.helpers import make_image


def test_preprocess_shape_and_range():
    out = preprocess_image(make_image("JPEG"), size=224)
    assert out.shape == (1, 224, 224, 3)
    assert out.dtype == np.float32
    assert 0.0 <= out.min() and out.max() <= 1.0


def test_png_with_alpha_converts_to_rgb():
    from io import BytesIO
    from PIL import Image
    buf = BytesIO()
    Image.new("RGBA", (64, 64), (10, 200, 10, 128)).save(buf, format="PNG")
    assert validate_and_open(buf.getvalue()).mode == "RGB"


@pytest.mark.parametrize("data", [b"", b"not an image", b"GIF89a" + b"\x00" * 20])
def test_invalid_bytes_rejected(data):
    with pytest.raises(InvalidImageError):
        validate_and_open(data)


def test_unsupported_format_rejected():
    with pytest.raises(InvalidImageError):
        validate_and_open(make_image("BMP"))


def test_tiny_image_rejected():
    with pytest.raises(InvalidImageError):
        validate_and_open(make_image("PNG", size=(8, 8)))


def test_seed_is_deterministic():
    img = make_image()
    assert image_seed(img) == image_seed(img)
