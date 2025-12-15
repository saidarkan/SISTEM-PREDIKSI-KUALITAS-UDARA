from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
from db import collection
from ispu import ispu_pm25, ispu_pm10, ispu_no2

app = FastAPI(title="Air Quality ML API")

# ======================
# LOAD MODEL
# ======================
try:
    model = joblib.load("model/model.pkl")
    encoder = joblib.load("model/label_encoder.pkl")
    FEATURES = joblib.load("model/features.pkl")
    print("✅ Model, encoder, features loaded successfully")
except Exception as e:
    print("❌ Error loading ML model:", e)
    raise e

# ======================
# Pydantic Model untuk input single predict
# ======================
class SensorInput(BaseModel):
    pm25: float
    pm10: float
    no2: float

# ======================
# PREDICT ALL DATA
# ======================
@app.post("/predict-all")
def predict_all():
    data = list(collection.find({}, {"_id": 0}))
    if not data:
        return {"message": "No data found"}

    df = pd.DataFrame(data)

    # Hitung ISPU
    df["ispu_pm25"] = df["pm25"].apply(ispu_pm25).round(2)
    df["ispu_pm10"] = df["pm10"].apply(ispu_pm10).round(2)
    df["ispu_no2"]  = df["no2"].apply(ispu_no2).round(2)
    df["ispu_overall"] = df[["ispu_pm25", "ispu_pm10", "ispu_no2"]].max(axis=1).round(2)

    # Prediksi ML
    try:
        X = df[FEATURES]
        pred = model.predict(X)
        df["prediction"] = encoder.inverse_transform(pred)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML prediction error: {e}")

    # Simpan ke MongoDB
    for row in df.to_dict("records"):
        collection.update_one(
            {"timestamp": row["timestamp"]},
            {"$set": {
                "ispu_overall": row["ispu_overall"],
                "prediction": row["prediction"]
            }}
        )

    return {
        "status": "success",
        "total_data": len(df)
    }

# ======================
# PREDICT SINGLE DATA
# ======================
@app.post("/predict")
def predict_one(payload: SensorInput):
    try:
        # Hitung ISPU
        ispu25 = ispu_pm25(payload.pm25)
        ispu10 = ispu_pm10(payload.pm10)
        ispuNo2 = ispu_no2(payload.no2)
        ispu_overall = round(max(ispu25, ispu10, ispuNo2), 2)

        # Siapkan data untuk model
        df = pd.DataFrame([{
            "pm25": payload.pm25,
            "pm10": payload.pm10,
            "no2": payload.no2,
            "ispu_overall": ispu_overall
        }])

        # Pastikan kolom sesuai FEATURES
        X = df.reindex(columns=FEATURES, fill_value=0)

        # Prediksi
        pred = model.predict(X)[0]
        label = encoder.inverse_transform([pred])[0]

        return {
            "ispu_overall": ispu_overall,
            "prediction": label
        }

    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing key: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

# ======================
# GET DATA UNTUK FRONTEND
# ======================
@app.get("/data")
def get_data():
    try:
        data = list(collection.find({}, {"_id": 0}))
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB fetch error: {e}")
