// tests/payasosRepository.integration.test.js
const db = require("../src/repository/payasosRepository");

describe("Pruebas de Integración: PayasosRepository + SQLite", () => {
  beforeAll(async () => {
    await db.init();
  });

  beforeEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  // --- init ---

  test("init: debe crear la tabla 'payasos' si no existe", async () => {
    // Si init falla lanza error; si llega aquí, la tabla existe
    await expect(db.init()).resolves.not.toThrow();
  });

  // --- savePayaso ---

  test("savePayaso: debe insertar un payaso y devolver su id y nombre", async () => {
    const result = await db.savePayaso({
      nombre: "Pepito",
      email: "pepito@circo.com",
      arma: "Tarta",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    expect(result.payaso).toBe("Pepito");
    expect(result.email).toBe("pepito@circo.com");
  });

  test("savePayaso: debe autoasignar IDs incrementales a distintos payasos", async () => {
    const r1 = await db.savePayaso({
      nombre: "Payaso A",
      email: "a@circo.com",
      arma: "Pistola de agua",
    });
    const r2 = await db.savePayaso({
      nombre: "Payaso B",
      email: "b@circo.com",
      arma: "Megáfono",
    });

    expect(r2.id).toBeGreaterThan(r1.id);
  });

  test("savePayaso: debe fallar si se inserta un email duplicado", async () => {
    await db.savePayaso({
      nombre: "Original",
      email: "dup@circo.com",
      arma: "Globo",
    });

    await expect(
      db.savePayaso({ nombre: "Copia", email: "dup@circo.com", arma: "Globo" })
    ).rejects.toThrow();
  });

  test("savePayaso: debe guardar el campo 'arma' como null si no se pasa", async () => {
    await db.savePayaso({
      nombre: "Sin arma",
      email: "sinarma@circo.com",
      arma: null,
    });

    const payaso = await db.findPayasoByEmail("sinarma@circo.com");
    expect(payaso.arma).toBeNull();
  });

  // --- findPayasoByEmail ---

  test("findPayasoByEmail: debe devolver el payaso correcto dado su email", async () => {
    await db.savePayaso({
      nombre: "Lola",
      email: "lola@circo.com",
      arma: "Cubo",
    });

    const found = await db.findPayasoByEmail("lola@circo.com");

    expect(found).not.toBeNull();
    expect(found.nombre).toBe("Lola");
    expect(found.email).toBe("lola@circo.com");
    expect(found.arma).toBe("Cubo");
  });

  test("findPayasoByEmail: debe devolver null si el email no existe", async () => {
    const found = await db.findPayasoByEmail("inexistente@circo.com");
    expect(found).toBeNull();
  });

  test("findPayasoByEmail: debe devolver null si se pasa null como email", async () => {
    const found = await db.findPayasoByEmail(null);
    expect(found).toBeNull();
  });

  // --- getAllPayasos ---

  test("getAllPayasos: debe devolver un array vacío si no hay payasos", async () => {
    const todos = await db.getAllPayasos();
    expect(todos).toEqual([]);
  });

  test("getAllPayasos: debe devolver todos los payasos insertados", async () => {
    await db.savePayaso({ nombre: "P1", email: "p1@c.com", arma: "A1" });
    await db.savePayaso({ nombre: "P2", email: "p2@c.com", arma: "A2" });
    await db.savePayaso({ nombre: "P3", email: "p3@c.com", arma: "A3" });

    const todos = await db.getAllPayasos();

    expect(todos).toHaveLength(3);
    expect(todos.map((p) => p.nombre)).toEqual(
      expect.arrayContaining(["P1", "P2", "P3"])
    );
  });

  test("getAllPayasos: cada payaso devuelto debe tener las columnas esperadas", async () => {
    await db.savePayaso({
      nombre: "Columnas",
      email: "cols@circo.com",
      arma: "Llave inglesa",
    });

    const [payaso] = await db.getAllPayasos();

    expect(payaso).toHaveProperty("id");
    expect(payaso).toHaveProperty("nombre");
    expect(payaso).toHaveProperty("email");
    expect(payaso).toHaveProperty("arma");
  });

  // --- clear ---

  test("clear: debe eliminar todos los registros sin borrar la tabla", async () => {
    await db.savePayaso({ nombre: "Temp", email: "temp@circo.com", arma: "X" });

    await db.clear();

    const todos = await db.getAllPayasos();
    expect(todos).toHaveLength(0);
  });

  test("clear: después de limpiar se pueden volver a insertar payasos", async () => {
    await db.savePayaso({ nombre: "Antes", email: "antes@c.com", arma: "A" });
    await db.clear();

    // No debe lanzar error al reinsertar
    await expect(
      db.savePayaso({ nombre: "Después", email: "despues@c.com", arma: "B" })
    ).resolves.toHaveProperty("id");
  });
});
