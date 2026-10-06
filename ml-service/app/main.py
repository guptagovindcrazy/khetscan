import logging
import os

from fastapi import FastAPI, File, HTTPException, UploadFile

from .model import ModelUnavailableError, PlantDiseaseModel
from .preprocessing import InvalidImageError
from .schemas import HealthResponse, PredictionResponse

logging.basicConfig(level=logging.INFO)
MAX_BYTES = int(float(os.getenv("MAX_IMAGE_MB", "10")) * 1024 * 1024)

app = FastAPI(title="Plant Disease ML Service", version="1.0.0")
model = PlantDiseaseModel()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if model.ready else "degraded",
        mode=model.mode,
        model_loaded=model.loaded,
        simulated=model.simulated,
        detail=None if model.ready else model.load_error,
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)) -> PredictionResponse:
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image is too large.")
    try:
        result = model.predict(data)
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ModelUnavailableError as exc:
        raise HTTPException(status_code=503, detail="The prediction model is not available.") from exc
    except Exception as exc:  # noqa: BLE001
        logging.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed.") from exc
    return PredictionResponse(**result, simulated=model.simulated, model_mode=model.mode)
