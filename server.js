// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

// ✅ CORS abierto
app.use(cors());

// ✅ Recibir body crudo (XML, JSON, texto, etc.)
app.use(express.text({ type: "*/*" }));

// Ruta de prueba opcional
app.get("/", (req, res) => {
  res.send("EasyCar proxy funcionando 😎");
});

// 🔁 PROXY GENÉRICO PARA SOAP Y REST
app.all("/proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).send("Falta parámetro ?url=");
    }

    const method = req.method;

    // Copiamos headers y limpiamos algunos que molestan
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.origin;
    delete headers.referer;
    delete headers["content-length"];

    // Para GET/HEAD no hay body
    const body = ["GET", "HEAD"].includes(method) ? undefined : req.body;

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    // Pasamos status + headers tal cual
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "content-encoding") return;
      res.setHeader(key, value);
    });

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("❌ Error Proxy:", error);
    res.status(500).send("ERROR PROXY");
  }
});

// 🚀 ARRANQUE DEL SERVIDOR (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ PROXY ACTIVO en puerto ${PORT}`);
});
