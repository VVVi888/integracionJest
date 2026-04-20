// src/service/payasosService.js
const db = require("../repository/payasosRepository");

async function registerPayaso(nombre, email, arma) {
  if (!nombre || !email) {
    throw new Error("El nombre y el email son obligatorios");
  }

  const existingPayaso = await db.findPayasoByEmail(email);
  if (existingPayaso) {
    throw new Error("El payaso ya está registrado con ese email");
  }

  const newPayaso = await db.savePayaso({ nombre, email, arma });
  return newPayaso;
}

async function getAllPayasos() {
  return await db.getAllPayasos();
}

async function getPayasoByEmail(email) {
  if (!email) {
    throw new Error("Email requerido");
  }
  return await db.findPayasoByEmail(email);
}

async function deletePayaso(email) {
  if (!email) {
    throw new Error("Email requerido para eliminar");
  }

  const deleted = await db.deletePayasoByEmail(email);
  if (!deleted) {
    throw new Error("Payaso no encontrado");
  }

  return { mensaje: `Payaso con email ${email} eliminado correctamente` };
}

async function updatePayaso(email, campos) {
  if (!email) {
    throw new Error("Email requerido para actualizar");
  }

  // Al menos uno de los campos modificables debe venir informado
  const { nombre, arma } = campos || {};
  if (!nombre && !arma) {
    throw new Error("Debes proporcionar al menos nombre o arma para actualizar");
  }

  const actualizado = await db.updatePayasoByEmail(email, { nombre, arma });
  if (!actualizado) {
    throw new Error("Payaso no encontrado");
  }

  return actualizado;
}

module.exports = {
  registerPayaso,
  getAllPayasos,
  getPayasoByEmail,
  deletePayaso,
  updatePayaso,
};
