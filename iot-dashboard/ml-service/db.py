from pymongo import MongoClient

MONGO_URI = "mongodb+srv://saidarkan3:AsuS1234@cluster0.jx7de9l.mongodb.net/"

client = MongoClient(MONGO_URI)
db = client["kualitasUdara"]
collection = db["alat_sensor"]
