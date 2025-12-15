// server.js
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
app.use(cors());

const uri = "mongodb+srv://saidarkan3:AsuS1234@cluster0.jx7de9l.mongodb.net/";
const client = new MongoClient(uri);
const db = client.db("kualitasUdara");
const collection = db.collection("alat_sensor");

app.get("/Tabel", async (req, res) => {
  try {
    const data = await collection.find().sort({ timestamp: 1 }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(5000, () => console.log("API running on port 5000"));
