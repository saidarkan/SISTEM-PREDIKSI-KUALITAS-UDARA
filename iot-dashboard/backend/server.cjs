require('dotenv').config();
const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const WebSocket = require('ws');
const axios = require('axios');
const ML_API_URL = process.env.ML_API_URL;

const MQTT_URL = process.env.MQTT_URL;
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'kamar/all/data';
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 8081;



// ====================================================
// 1. MONGODB CONNECTION
// ====================================================

const mongo = new MongoClient(MONGO_URI);
let collection;

async function initMongo() {
  try {
    await mongo.connect();
    const db = mongo.db("kualitasUdara");
    collection = db.collection("alat_sensor");
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Mongo connect error:", err);
    process.exit(1);
  }
}

initMongo();

// ====================================================
// 2. WEBSOCKET SERVER
// ====================================================

const wss = new WebSocket.Server({ port: PORT });

wss.on("listening", () => {
  console.log(`WebSocket server running → ws://localhost:${PORT}`);
});

/**
 * Kirim HISTORY (120 data terbaru) ketika frontend connect
 */
async function sendHistory(ws) {
  if (!collection) return;

  try {
    const history = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(120)
      .toArray();

    history.reverse(); // urutkan dari paling lama ke terbaru

    ws.send(
      JSON.stringify({
        type: "history",
        data: history,
      })
    );

    console.log(`✓ Sent ${history.length} history records`);
  } catch (err) {
    console.error("Error sending history:", err);
  }
}

wss.on("connection", async (ws) => {
  console.log("Frontend Connected");

  ws.send(JSON.stringify({ type: "info", msg: "Connected to WebSocket server" }));

  // KIRIM HISTORY
  await sendHistory(ws);
});

// broadcast helper
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// ====================================================
// 3. MQTT CLIENT
// ====================================================

const mqttClient = mqtt.connect(MQTT_URL, {
  reconnectPeriod: 5000,
});

mqttClient.on("connect", () => {
  console.log("Connected to MQTT Broker");

  mqttClient.subscribe(MQTT_TOPIC, { qos: 0 }, (err) => {
    if (err) console.error("MQTT Subscribe Error:", err);
    else console.log(`Subscribed to topic → ${MQTT_TOPIC}`);
  });
});

mqttClient.on("error", (err) => {
  console.error("MQTT Error:", err);
});

// ====================================================
// 4. HANDLE INCOMING MQTT DATA
// ====================================================

mqttClient.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    // ===== FORMAT TIMESTAMP =====
    payload.timestamp = payload.timestamp
      ? new Date(payload.timestamp)
      : new Date();

    // ===== PANGGIL FASTAPI (MODEL.PKL) =====
    const mlRes = await axios.post(ML_API_URL, {
      pm25: payload.pm25,
      pm10: payload.pm10,
      no2: payload.no2
    });

    const finalData = {
      pm25: payload.pm25,
      pm10: payload.pm10,
      no2: payload.no2,
      temperature: payload.temperature,
      humidity: payload.humidity,
      ispu_overall: mlRes.data.ispu_overall,
      prediction: mlRes.data.prediction,
      timestamp: payload.timestamp
    };

    // ===== SIMPAN KE MONGODB =====
    if (collection) {
      await collection.insertOne(finalData);
    }

    // ===== KIRIM REALTIME KE FRONTEND =====
    broadcast({
      type: "sensor",
      data: finalData,
    });

    console.log("✓ Data realtime + ML:", finalData);

  } catch (err) {
    console.error("Message processing error:", err.message);
  }
});
