from pymongo import MongoClient
import pandas as pd

# Koneksi ke MongoDB Atlas
MONGO_URI = "mongodb+srv://saidarkan3:AsuS1234@cluster0.jx7de9l.mongodb.net/"
client = MongoClient (MONGO_URI)
db = client["kualitasUdara"]
collection = db["alat_sensor"]
#Ambil semua data

data = list(collection.find())
# Export ke JSON
import json
with open("data.json", "w") as f:
    json.dump(data, f, default=str, indent=4)

# Export ke CSV
df = pd.DataFrame(data)
df.to_csv("data_sensor.csv", index=False)