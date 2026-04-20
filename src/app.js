// src/app.js
// Exporta la app de Express sin arrancar el servidor,
// lo que permite importarla en los tests del controller.
const cors = require("cors");
const express = require("express");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/payasos", require("./controllers/payasosController"));

module.exports = app;
