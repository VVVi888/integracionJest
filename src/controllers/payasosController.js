// src/controllers/payasosController.js
const express = require("express");
const router = express.Router();
const service = require("../service/payasosService");

// GET /payasos → obtener todos
router.get("/", async (req, res) => {
  try {
    const payasos = await service.getAllPayasos();
    res.json(payasos);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /payasos/:email → obtener uno por email
router.get("/:email", async (req, res) => {
  try {
    const payaso = await service.getPayasoByEmail(req.params.email);
    if (!payaso) {
      return res.status(404).json({ error: "Payaso no encontrado" });
    }
    res.json(payaso);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /payasos → crear uno nuevo
router.post("/", async (req, res) => {
  try {
    const { nombre, email, arma } = req.body;
    const nuevo = await service.registerPayaso(nombre, email, arma);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /payasos/:email → actualizar nombre y/o arma de un payaso existente
router.put("/:email", async (req, res) => {
  try {
    const { nombre, arma } = req.body;
    const actualizado = await service.updatePayaso(req.params.email, {
      nombre,
      arma,
    });
    res.json(actualizado);
  } catch (err) {
    const status = err.message === "Payaso no encontrado" ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

// DELETE /payasos/:email → eliminar un payaso por email
router.delete("/:email", async (req, res) => {
  try {
    const resultado = await service.deletePayaso(req.params.email);
    res.json(resultado);
  } catch (err) {
    const status = err.message === "Payaso no encontrado" ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;
