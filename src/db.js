// src/db.js

// Usamos un array en memoria para simular las tablas de una base de datos
const payasosDb = [];

const db = {
  // Simula una consulta SELECT
  findPayasoByEmail: async (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payaso = payasosDb.find((u) => u.email === email);
        resolve(payaso || null);
      }, 50); // Simula 50ms de latencia de red
    });
  },

  // Simula una consulta INSERT
  savePayaso: async (payaso) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        payaso.id = Date.now(); // Asignamos un ID ficticio
        payasosDb.push(payaso);
        resolve(payaso);
      }, 50);
    });
  },

  // Función exclusiva para testing: limpia la base de datos entre pruebas
  clear: () => {
    payasosDb.length = 0;
  },
};

module.exports = db;
