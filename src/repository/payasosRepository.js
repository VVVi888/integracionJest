// src/repository/payasosRepository.js
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let dbConnection;

const db = {
  // 1. Inicializamos la BD y creamos la tabla
  init: async () => {
    dbConnection = await open({
      filename: "./test.sqlite",
      driver: sqlite3.Database,
    });

    await dbConnection.exec(`
      CREATE TABLE IF NOT EXISTS payasos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        arma TEXT
      )
    `);
  },

  // 2. Buscar payaso por email
  findPayasoByEmail: async (email) => {
    const payaso = await dbConnection.get(
      "SELECT * FROM payasos WHERE email = ?",
      [email]
    );
    return payaso || null;
  },

  // 3. Guardar payaso
  savePayaso: async (payaso) => {
    const result = await dbConnection.run(
      "INSERT INTO payasos (nombre, email, arma) VALUES (?, ?, ?)",
      [payaso.nombre, payaso.email, payaso.arma]
    );
    return { id: result.lastID, payaso: payaso.nombre, email: payaso.email };
  },

  // 4. Eliminar payaso por email → devuelve true si se borró algo, false si no existía
  deletePayasoByEmail: async (email) => {
    const result = await dbConnection.run(
      "DELETE FROM payasos WHERE email = ?",
      [email]
    );
    return result.changes > 0;
  },

  // 5. Actualizar nombre y/o arma de un payaso por email
  updatePayasoByEmail: async (email, campos) => {
    const { nombre, arma } = campos;
    const result = await dbConnection.run(
      "UPDATE payasos SET nombre = COALESCE(?, nombre), arma = COALESCE(?, arma) WHERE email = ?",
      [nombre ?? null, arma ?? null, email]
    );
    if (result.changes === 0) return null;
    return await dbConnection.get(
      "SELECT * FROM payasos WHERE email = ?",
      [email]
    );
  },

  // 6. Limpiar la base de datos entre pruebas
  clear: async () => {
    await dbConnection.run("DELETE FROM payasos");
  },

  // 7. Cerrar la conexión al terminar todo
  close: async () => {
    if (dbConnection) {
      await dbConnection.close();
    }
  },

  // 8. Obtener todos los payasos
  getAllPayasos: async () => {
    const payasos = await dbConnection.all("SELECT * FROM payasos");
    return payasos;
  },
};

module.exports = db;
