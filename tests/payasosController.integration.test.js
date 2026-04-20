// tests/payasosController.integration.test.js
//
// REQUISITO: instala supertest antes de ejecutar este archivo:
//   npm install --save-dev supertest
//
const request = require("supertest");
const app = require("../src/app");
const db = require("../src/repository/payasosRepository");

describe("Pruebas de Integración HTTP: PayasosController", () => {
  beforeAll(async () => {
    await db.init();
  });

  beforeEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  // ─── GET /payasos ────────────────────────────────────────────────────────────

  describe("GET /payasos", () => {
    test("debe responder 200 y un array vacío cuando no hay payasos", async () => {
      const res = await request(app).get("/payasos");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    test("debe devolver todos los payasos registrados", async () => {
      await request(app)
        .post("/payasos")
        .send({ nombre: "Luna", email: "luna@c.com", arma: "Corneta" });
      await request(app)
        .post("/payasos")
        .send({ nombre: "Sol", email: "sol@c.com", arma: "Trompeta" });

      const res = await request(app).get("/payasos");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.map((p) => p.nombre)).toEqual(
        expect.arrayContaining(["Luna", "Sol"])
      );
    });

    test("cada payaso en la lista debe tener id, nombre, email y arma", async () => {
      await request(app)
        .post("/payasos")
        .send({ nombre: "Campos", email: "campos@c.com", arma: "Escoba" });

      const res = await request(app).get("/payasos");
      const payaso = res.body[0];

      expect(payaso).toHaveProperty("id");
      expect(payaso).toHaveProperty("nombre");
      expect(payaso).toHaveProperty("email");
      expect(payaso).toHaveProperty("arma");
    });
  });

  // ─── GET /payasos/:email ─────────────────────────────────────────────────────

  describe("GET /payasos/:email", () => {
    test("debe responder 200 y el payaso si el email existe", async () => {
      await request(app)
        .post("/payasos")
        .send({ nombre: "Rojo", email: "rojo@circo.com", arma: "Globo" });

      const res = await request(app).get("/payasos/rojo@circo.com");

      expect(res.statusCode).toBe(200);
      expect(res.body.nombre).toBe("Rojo");
      expect(res.body.email).toBe("rojo@circo.com");
    });

    test("debe responder 404 si el email no está registrado", async () => {
      const res = await request(app).get("/payasos/noexiste@circo.com");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Payaso no encontrado");
    });
  });

  // ─── POST /payasos ───────────────────────────────────────────────────────────

  describe("POST /payasos", () => {
    test("debe responder 201 y los datos del nuevo payaso al crear uno válido", async () => {
      const res = await request(app)
        .post("/payasos")
        .send({ nombre: "Nuevo", email: "nuevo@circo.com", arma: "Mazo" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.payaso).toBe("Nuevo");
      expect(res.body.email).toBe("nuevo@circo.com");
    });

    test("debe responder 400 si falta el nombre", async () => {
      const res = await request(app)
        .post("/payasos")
        .send({ email: "sinnombre@circo.com", arma: "Pistola" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/obligatorio/i);
    });

    test("debe responder 400 si falta el email", async () => {
      const res = await request(app)
        .post("/payasos")
        .send({ nombre: "Sin email", arma: "Cuchillo" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/obligatorio/i);
    });

    test("debe responder 400 si se intenta registrar un email duplicado", async () => {
      await request(app)
        .post("/payasos")
        .send({ nombre: "Original", email: "dup@circo.com", arma: "Vuvuzela" });

      const res = await request(app)
        .post("/payasos")
        .send({ nombre: "Copia", email: "dup@circo.com", arma: "Silbato" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/ya está registrado/i);
    });

    test("debe responder 400 si el body está completamente vacío", async () => {
      const res = await request(app).post("/payasos").send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("el payaso recién creado debe aparecer al hacer GET /payasos", async () => {
      await request(app)
        .post("/payasos")
        .send({ nombre: "Visible", email: "visible@circo.com", arma: "Altavoz" });

      const res = await request(app).get("/payasos");

      expect(res.body.some((p) => p.email === "visible@circo.com")).toBe(true);
    });
  });
});
