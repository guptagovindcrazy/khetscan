# ML service

FastAPI service that classifies a leaf image. It is independent of the Node backend.

| Endpoint | Description |
| --- | --- |
| `GET /health` | `{status, mode, model_loaded, simulated}`. `degraded` when production mode has no model. |
| `POST /predict` | multipart field `file` (JPG/PNG, up to `MAX_IMAGE_MB`). Returns crop, disease, confidence, top 3, symptoms, treatment, prevention. |

## Modes (`ML_MODE`)

- `demo` (default): **simulated** predictions, repeatable per image. They are not a diagnosis. Responses carry `simulated: true` and the UI shows a warning.
- `production`: requires `models/plant_disease_model.keras` and `models/class_names.json`. Without them `/predict` returns 503.
- `auto`: uses the real model if the files exist, otherwise falls back to demo.

## Run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # optional
uvicorn app.main:app --reload --port 8000
pytest
```

TensorFlow is only imported when a real model is loaded, so demo mode starts quickly.
See [training/README.md](training/README.md) to train a real model.
