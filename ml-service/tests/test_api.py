import pytest
from fastapi.testclient import TestClient

from app.main import app
from tests.helpers import make_image

client = TestClient(app)


def test_health_demo_mode():
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["mode"] == "demo"
    assert body["simulated"] is True


def test_predict_returns_structured_result():
    res = client.post("/predict", files={"file": ("leaf.png", make_image(), "image/png")})
    assert res.status_code == 200
    body = res.json()
    assert body["simulated"] is True
    assert body["status"] in {"healthy", "diseased"}
    assert 0 < body["confidence"] <= 100
    assert len(body["top_predictions"]) == 3
    assert body["treatment"] and body["prevention"]


def test_predict_is_repeatable():
    files = lambda: {"file": ("leaf.png", make_image(), "image/png")}
    assert client.post("/predict", files=files()).json() == client.post("/predict", files=files()).json()


def test_predict_rejects_invalid_image():
    res = client.post("/predict", files={"file": ("x.png", b"garbage", "image/png")})
    assert res.status_code == 400


def test_production_without_model_returns_503(monkeypatch):
    from app.main import model
    monkeypatch.setattr(model, "mode", "production")
    res = client.post("/predict", files={"file": ("leaf.png", make_image(), "image/png")})
    assert res.status_code == 503
    assert client.get("/health").json()["status"] == "degraded"
