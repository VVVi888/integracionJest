// src/payasoService.js
const db = require("../db");

async function registerPayaso(name, email) {
  if (!name || !email) {
    throw new Error("El nombre y el email son obligatorios");
  }

  // 1. Verificamos en la base de datos si el email ya existe
  const existingPayaso = await db.findPayasoByEmail(email);

  if (existingPayaso) {
    throw new Error("El payaso ya está registrado con ese email");
  }

  // 2. Si no existe, lo guardamos en la base de datos
  const newPayaso = await db.savePayaso({ name, email });

  return newPayaso;
}

module.exports = { registerPayaso };
