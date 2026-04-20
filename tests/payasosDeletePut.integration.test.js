// tests/payasosDeletePut.integration.test.js
const request = require("supertest");
const app = require("../src/app");
const db = require("../src/repository/payasosRepository");

describe("Pruebas de Integración: DELETE y PUT", () => {
  beforeAll(async () => {
    await db.init();
  });

  beforeEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  async function crearPayaso(nombre, email, arma) {
    await request(app).post("/payasos").send({ nombre, email, arma });
  }

  // ─── DELETE /payasos/:email ───────────────────────────────────────────────────

  describe("DELETE /payasos/:email", () => {
    test("debe responder 200 y un mensaje de éxito al borrar un payaso existente", async () => {
      await crearPayaso("Borrable", "borrar@c.com", "Hacha de goma");

      const res = await request(app).delete("/payasos/borrar@c.com");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("mensaje");
      expect(res.body.mensaje).toMatch(/eliminado correctamente/i);
    });

    test("el payaso eliminado ya no debe aparecer en GET /payasos", async () => {
      await crearPayaso("Efímero", "efimero@c.com", "Globo");

      await request(app).delete("/payasos/efimero@c.com");

      const res = await request(app).get("/payasos");
      expect(res.body.some((p) => p.email === "efimero@c.com")).toBe(false);
    });

    test("el payaso eliminado ya no debe aparecer en GET /payasos/:email", async () => {
      await crearPayaso("Humo", "humo@c.com", "Bengala");

      await request(app).delete("/payasos/humo@c.com");

      const res = await request(app).get("/payasos/humo@c.com");
      expect(res.statusCode).toBe(404);
    });

    test("debe responder 404 si el email no existe", async () => {
      const res = await request(app).delete("/payasos/fantasma@c.com");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Payaso no encontrado");
    });

    test("borrar uno no debe afectar a los demás payasos", async () => {
      await crearPayaso("Queda", "queda@c.com", "Trompeta");
      await crearPayaso("SeVa", "seva@c.com", "Silbato");

      await request(app).delete("/payasos/seva@c.com");

      const res = await request(app).get("/payasos");
      expect(res.body).toHaveLength(1);
      expect(res.body[0].email).toBe("queda@c.com");
    });

    test("no debe poder borrar el mismo payaso dos veces", async () => {
      await crearPayaso("Único", "unico@c.com", "Corneta");

      await request(app).delete("/payasos/unico@c.com");
      const res = await request(app).delete("/payasos/unico@c.com");

      expect(res.statusCode).toBe(404);
    });
  });

  // ─── PUT /payasos/:email ──────────────────────────────────────────────────────

  describe("PUT /payasos/:email", () => {
    test("debe responder 200 y los datos actualizados al cambiar el nombre", async () => {
      await crearPayaso("NombreViejo", "cambio@c.com", "Pistola");

      const res = await request(app)
        .put("/payasos/cambio@c.com")
        .send({ nombre: "NombreNuevo" });

      expect(res.statusCode).toBe(200);
      expect(res.body.nombre).toBe("NombreNuevo");
      expect(res.body.email).toBe("cambio@c.com"); // el email no cambia
    });

    test("debe actualizar correctamente el campo arma", async () => {
      await crearPayaso("Armado", "arma@c.com", "Pistola de agua");

      const res = await request(app)
        .put("/payasos/arma@c.com")
        .send({ arma: "Cañón de confeti" });

      expect(res.statusCode).toBe(200);
      expect(res.body.arma).toBe("Cañón de confeti");
    });

    test("debe actualizar nombre y arma a la vez", async () => {
      await crearPayaso("Viejo", "ambos@c.com", "Escopeta de agua");

      const res = await request(app)
        .put("/payasos/ambos@c.com")
        .send({ nombre: "Nuevo", arma: "Lanzatortas" });

      expect(res.statusCode).toBe(200);
      expect(res.body.nombre).toBe("Nuevo");
      expect(res.body.arma).toBe("Lanzatortas");
    });

    test("los campos no enviados deben conservar su valor anterior", async () => {
      await crearPayaso("SoloNombre", "conserva@c.com", "Arma original");

      const res = await request(app)
        .put("/payasos/conserva@c.com")
        .send({ nombre: "NombreActualizado" });

      expect(res.body.arma).toBe("Arma original"); // arma no cambió
    });

    test("debe responder 404 si el email no existe", async () => {
      const res = await request(app)
        .put("/payasos/noexiste@c.com")
        .send({ nombre: "Nadie" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Payaso no encontrado");
    });

    test("debe responder 400 si no se envía ningún campo a actualizar", async () => {
      await crearPayaso("SinCambio", "sincambio@c.com", "Maza");

      const res = await request(app)
        .put("/payasos/sincambio@c.com")
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/nombre o arma/i);
    });

    test("el email del payaso no debe cambiar tras un PUT", async () => {
      await crearPayaso("EmailFijo", "fijo@c.com", "Látigo de espuma");

      await request(app)
        .put("/payasos/fijo@c.com")
        .send({ nombre: "EmailFijoActualizado" });

      const res = await request(app).get("/payasos/fijo@c.com");
      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe("fijo@c.com");
    });

    test("un PUT no debe modificar otros payasos", async () => {
      await crearPayaso("Intacto", "intacto@c.com", "Chicle explosivo");
      await crearPayaso("Modificado", "modif@c.com", "Pistola");

      await request(app)
        .put("/payasos/modif@c.com")
        .send({ nombre: "YaModificado" });

      const intacto = await request(app).get("/payasos/intacto@c.com");
      expect(intacto.body.nombre).toBe("Intacto");
    });
  });
});
