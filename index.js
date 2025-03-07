import express from "express";
import mysql from "mysql2/promise";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors"; // <-- Importar cors

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const db = await mysql.createConnection({
  host: "178.128.184.11",
  user: "taller",
  password: "taller_23",
  database: "taller",
});

const OPENAI_KEY = process.env.OPENAI_KEY;
const openai = new OpenAI({ apiKey: OPENAI_KEY });

app.post("/analizar-sentimiento", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Texto requerido" });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content:
            "Analiza el sentimiento del siguiente texto y responde con 'positivo', 'negativo', 'neutral' :" +
            text,
        },
      ],
    });

    // const sentiment = response;
    console.log(JSON.stringify(response));
    const sentiment = response.choices[0].message.content
      .trim()
      .replace(/['"]+/g, "")
      .toLowerCase();

    console.log("==============");
    console.log(JSON.stringify(response));
    console.log("==============");

    console.log(sentiment);
    await db.execute(
      "INSERT INTO sentimientos (text, sentiment) VALUES (?, ?)",
      [text, sentiment]
    );
    res.status(200).json({ text, sentiment });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: error });
  }
});

app.post("/analizar-sentimientos", async (req, res) => {});

app.get("/sentiments", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM sentiments");
  res.json(rows);
});

app.get("/animales", async (req, res) => {
  const animales = [
    { name: "perro", comida: "croquetas" },
    { name: "conejo", comida: "apio" },
  ];
  // const [rows] = await db.execute("SELECT * FROM sentiments");

  console.log(animales);
  const animal3 = animales[1].comida;
  res.json({ array: animal3 });
});

app.listen(3010, () => {
  console.log("Server is running on http://localhost:3010");
});
