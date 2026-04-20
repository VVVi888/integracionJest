// tests/payasosServiceExtra.integration.test.js
const {
  registerPayaso,
  getAllPayasos,
  getPayasoByEmail,
} = require("../src/service/payasosService");
const db = require("../src/repository/payasosRepository");

describe("Pruebas de Integración: getAllPayasos y getPayasoByEmail", () => {
  beforeAll(async () => {
    await db.init();
  });

  beforeEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  // --- getAllPayasos ---

  test("getAllPayasos: debe devolver un array vacío cuando no hay payasos", async () => {
    const resultado = await getAllPayasos();
    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado).toHaveLength(0);
  });

  test("getAllPayasos: debe devolver todos los payasos registrados", async () => {
    await registerPayaso("Manolo", "manolo@circo.com", "Pastel");
    await registerPayaso("Juanito", "juanito@circo.com", "Flor de agua");

    const resultado = await getAllPayasos();

    expect(resultado).toHaveLength(2);
    expect(resultado.map((p) => p.nombre)).toEqual(
      expect.arrayContaining(["Manolo", "Juanito"])
    );
  });

  test("getAllPayasos: el número de payasos crece correctamente con cada registro", async () => {
    expect(await getAllPayasos()).toHaveLength(0);

    await registerPayaso("P1", "p1@c.com", "A");
    expect(await getAllPayasos()).toHaveLength(1);

    await registerPayaso("P2", "p2@c.com", "B");
    expect(await getAllPayasos()).toHaveLength(2);
  });

  test("getAllPayasos: cada payaso devuelto incluye id, nombre, email y arma", async () => {
    await registerPayaso("Estructura", "estructura@circo.com", "Mazo");

    const [payaso] = await getAllPayasos();

    expect(payaso).toHaveProperty("id");
    expect(payaso).toHaveProperty("nombre", "Estructura");
    expect(payaso).toHaveProperty("email", "estructura@circo.com");
    expect(payaso).toHaveProperty("arma", "Mazo");
  });

  // --- getPayasoByEmail ---

  test("getPayasoByEmail: debe devolver el payaso correcto dado su email", async () => {
    await registerPayaso("Beatriz", "bea@circo.com", "Pistola de confeti");

    const resultado = await getPayasoByEmail("bea@circo.com");

    expect(resultado).not.toBeNull();
    expect(resultado.nombre).toBe("Beatriz");
    expect(resultado.email).toBe("bea@circo.com");
  });

  test("getPayasoByEmail: debe devolver null si el email no está registrado", async () => {
    const resultado = await getPayasoByEmail("fantasma@circo.com");
    expect(resultado).toBeNull();
  });

  test("getPayasoByEmail: debe lanzar error si se llama sin email", async () => {
    await expect(getPayasoByEmail(null)).rejects.toThrow("Email requerido");
    await expect(getPayasoByEmail(undefined)).rejects.toThrow("Email requerido");
    await expect(getPayasoByEmail("")).rejects.toThrow("Email requerido");
  });

  test("getPayasoByEmail: no debe confundir emails parecidos", async () => {
    await registerPayaso("Real", "real@circo.com", "Trombón");

    const noExiste = await getPayasoByEmail("real@circo.es"); // dominio distinto
    expect(noExiste).toBeNull();

    const siExiste = await getPayasoByEmail("real@circo.com");
    expect(siExiste).not.toBeNull();
  });
});
