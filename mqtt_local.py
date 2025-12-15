import json
import paho.mqtt.client as mqtt
from pymongo import MongoClient

# --- MongoDB Atlas ---
MONGO_URI = "mongodb+srv://saidarkan3:AsuS1234@cluster0.jx7de9l.mongodb.net/"
mongo = MongoClient(MONGO_URI)

db = mongo["kualitasUdara"]   # database di Atlas
collection = db["alat_sensor"]       # collection di Atlas

# --- MQTT ---
BROKER = "160.187.144.142"
PORT = 1883
TOPIC = "kamar/all/data"

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT:", rc)
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        print("Data diterima:", payload)

        # simpan ke Atlas
        collection.insert_one(payload)
        print("Simpan ke Atlas OK!")

    except Exception as e:
        print("Error:", e)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT)
client.loop_forever()
