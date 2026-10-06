from typing import List, Literal, Optional

from pydantic import BaseModel


class TopPrediction(BaseModel):
    crop: str
    disease: str
    confidence: float
    status: Literal["healthy", "diseased"]


class PredictionResponse(BaseModel):
    crop: str
    disease: str
    confidence: float
    status: Literal["healthy", "diseased"]
    top_predictions: List[TopPrediction]
    symptoms: str
    treatment: List[str]
    prevention: List[str]
    simulated: bool
    model_mode: str


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    mode: str
    model_loaded: bool
    simulated: bool
    detail: Optional[str] = None
