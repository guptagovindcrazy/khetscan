"""Model wrapper with three modes: demo (simulated), production (real model required), auto."""
import json
import logging
import os
import random
from pathlib import Path
from typing import List, Optional

import numpy as np

from .disease_info import DISEASES, lookup
from .preprocessing import image_seed, preprocess_image

logger = logging.getLogger("ml-service")
BASE_DIR = Path(__file__).resolve().parent.parent


class ModelUnavailableError(RuntimeError):
    """Raised when production inference is requested but no model is loaded."""


class PlantDiseaseModel:
    def __init__(self) -> None:
        self.mode = os.getenv("ML_MODE", "demo").lower()
        if self.mode not in {"demo", "production", "auto"}:
            logger.warning("Unknown ML_MODE %r; falling back to demo", self.mode)
            self.mode = "demo"
        self.image_size = int(os.getenv("IMAGE_SIZE", "224"))
        self.model_path = self._resolve(os.getenv("MODEL_PATH", "models/plant_disease_model.keras"))
        self.class_path = self._resolve(os.getenv("CLASS_NAMES_PATH", "models/class_names.json"))
        self.model = None
        self.class_names: List[str] = []
        self.load_error: Optional[str] = None
        if self.mode in {"production", "auto"}:
            self._try_load()

    @staticmethod
    def _resolve(path: str) -> Path:
        p = Path(path)
        return p if p.is_absolute() else BASE_DIR / p

    def _try_load(self) -> None:
        if not self.model_path.exists() or not self.class_path.exists():
            self.load_error = f"Model files not found ({self.model_path.name}, {self.class_path.name})."
            return
        try:
            import tensorflow as tf  # imported lazily so demo mode starts fast

            self.model = tf.keras.models.load_model(self.model_path)
            self.class_names = json.loads(self.class_path.read_text())
            logger.info("Loaded model with %d classes", len(self.class_names))
        except Exception as exc:  # noqa: BLE001 - report any load failure via /health
            self.model = None
            self.load_error = f"Model failed to load: {exc.__class__.__name__}"
            logger.exception("Model load failed")

    @property
    def loaded(self) -> bool:
        return self.model is not None

    @property
    def simulated(self) -> bool:
        return not self.loaded

    @property
    def ready(self) -> bool:
        """Can serve predictions in the current mode."""
        if self.mode == "production":
            return self.loaded
        return True

    def predict(self, data: bytes, top_k: int = 3) -> dict:
        if self.loaded:
            probs = self._real_probs(data)
            names = self.class_names
        elif self.mode == "production":
            raise ModelUnavailableError(self.load_error or "No trained model is loaded.")
        else:
            probs, names = self._demo_probs(data)
        return self._build_result(probs, names, top_k)

    def _real_probs(self, data: bytes) -> np.ndarray:
        batch = preprocess_image(data, self.image_size)
        return np.asarray(self.model.predict(batch, verbose=0)[0], dtype=np.float64)

    @staticmethod
    def _demo_probs(data: bytes):
        """Simulated, repeatable scores. Not a real diagnosis."""
        preprocess_image(data)  # still validates the upload
        rng = random.Random(image_seed(data))
        names = list(DISEASES.keys())
        winner = rng.randrange(len(names))
        top = rng.uniform(0.82, 0.98)
        rest = np.array([rng.random() ** 3 for _ in names], dtype=np.float64)
        rest[winner] = 0
        rest = rest / rest.sum() * (1 - top)
        rest[winner] = top
        return rest, names

    @staticmethod
    def _build_result(probs: np.ndarray, names: List[str], top_k: int) -> dict:
        order = np.argsort(probs)[::-1][:top_k]
        top = []
        for idx in order:
            info = lookup(names[idx])
            top.append({"crop": info["crop"], "disease": info["disease"],
                        "confidence": round(float(probs[idx]) * 100, 1),
                        "status": "healthy" if info["healthy"] else "diseased"})
        best = lookup(names[order[0]])
        return {**top[0], "top_predictions": top, "symptoms": best["symptoms"],
                "treatment": best["treatment"], "prevention": best["prevention"]}
