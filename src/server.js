// src/server.js
const cors = require("cors");
const express = require("express");
const app = express();
const db = require("./repository/payasosRepository");

// Middleware para leer JSON
app.use(cors());
app.use(express.json());

// Montamos directamente el controller que ya contiene las rutas
app.use("/payasos", require("./controllers/payasosController"));

async function startServer() {
  try {
    await db.init(); // Inicializa la base de datos
    console.log("Base de datos inicializada");

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error iniciando el servidor:", err);
  }
}

startServer();
