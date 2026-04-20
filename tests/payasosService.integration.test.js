// tests/userService.integration.test.js
const { registerPayaso } = require("../src/service/payasosService");
const db = require("../src/repository/payasosRepository");

describe("Pruebas de Integración: PayasoService + SQLite", () => {
  // ANTES DE TODAS LAS PRUEBAS: Abrimos la BD y creamos la tabla
  beforeAll(async () => {
    await db.init();
  });

  // ANTES DE CADA PRUEBA: Limpiamos los datos para que sean independientes
  beforeEach(async () => {
    await db.clear();
  });

  // DESPUÉS DE TODAS LAS PRUEBAS: Cerramos la conexión
  afterAll(async () => {
    await db.close();
  });

  // --- LAS PRUEBAS SON EXACTAMENTE IGUALES QUE ANTES ---

  test("Debe registrar un payaso nuevo y guardarlo en la base de datos", async () => {
    const result = await registerPayaso(
      "Ana López",
      "ana@ejemplo.com",
      "Pelota",
    );

    expect(result).toHaveProperty("id");
    expect(result.payaso).toBe("Ana López");

    const payasoInDb = await db.findPayasoByEmail("ana@ejemplo.com");
    expect(payasoInDb).not.toBeNull();
    expect(payasoInDb.nombre).toBe("Ana López");
  });

  test("Debe lanzar un error si intentamos registrar un email duplicado", async () => {
    await registerPayaso("Carlos Perez", "carlos@ejemplo.com", "Cuchillo");

    await expect(
      registerPayaso("Carlos Falso", "carlos@ejemplo.com", "Tarta"),
    ).rejects.toThrow("El payaso ya está registrado con ese email");
  });

  test("Debe lanzar un error si faltan datos y no tocar la base de datos", async () => {
    await expect(registerPayaso("Solo Nombre", null, null)).rejects.toThrow(
      "El nombre y el email son obligatorios",
    );

    const payasoInDb = await db.findPayasoByEmail(null);
    expect(payasoInDb).toBeNull();
  });
});
