# Training

1. Download the PlantVillage dataset (e.g. from Kaggle, "color" images) and arrange it as
   `ml-service/data/plantvillage/<Class_Name>/*.jpg`. Class folder names should follow
   `Crop___Condition` (for example `Tomato___Early_blight`).
2. `python training/preprocess.py --data-dir data/plantvillage --delete-corrupt`
3. `python training/train.py` (a GPU is strongly recommended)
4. `python training/evaluate.py`
5. Set `ML_MODE=auto` (or `production`) and restart the service. It loads
   `models/plant_disease_model.keras` and `models/class_names.json`.

`models/metrics.json` records the validation accuracy measured on the 20% hold-out split.
Only report that number. No accuracy figure ships with this repository.
