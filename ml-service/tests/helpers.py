from io import BytesIO

from PIL import Image


def make_image(fmt: str = "PNG", size=(120, 90), color=(40, 140, 60)) -> bytes:
    buf = BytesIO()
    Image.new("RGB", size, color).save(buf, format=fmt)
    return buf.getvalue()
