from kafka import KafkaConsumer
from pymongo import MongoClient
import json

# Konfigurasi Kafka
KAFKA_BROKER = "localhost:9092"  # ganti sesuai Kafka broker
KAFKA_TOPIC = "iot-topic"

consumer = KafkaConsumer(
    KAFKA_TOPIC,
    bootstrap_servers=[KAFKA_BROKER],
    auto_offset_reset='earliest',
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

# Konfigurasi MongoDB Atlas
MONGO_URI = "mongodb+srv://saidarkan3:AsuS1234@cluster0.jx7de9l.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["kualitasUDara"]
collection = db["data_sensor"]

print("Listening to Kafka topic...")

# Konsumsi data dari Kafka dan simpan ke MongoDB Atlas
for message in consumer:
    data = message.value
    print("Received:", data)
    collection.insert_one(data)
    print("Saved to MongoDB Atlas")
