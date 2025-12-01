const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// ✅ Abrir CORS para todos
app.use(cors());

// ✅ Permitir recibir XML SOAP crudo
app.use(express.text({ type: '*/*' }));

// 🔁 PROXY SOAP
app.post('/proxy', async (req, res) => {

    try {

        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).send("Falta parámetro ?url=");
        }

        const soapAction = req.headers["soapaction"] || "";

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": soapAction
            },
            body: req.body
        });

        const data = await response.text();

        res.set("Content-Type", "text/xml");
        res.send(data);

    } catch (error) {

        console.error("❌ Error Proxy:", error);
        res.status(500).send("ERROR PROXY SOAP");
    }

});

// 🚀 ARRANQUE DEL SERVIDOR
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`✅ SOAP PROXY ACTIVO en http://localhost:${PORT}`);
});
