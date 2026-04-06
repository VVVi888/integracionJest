// tests/payasoService.integration.test.js
const { registerPayaso } = require("../src/Service/payasosService");
const db = require("../src/db");

describe("Pruebas de Integración: PayasoService + Database", () => {
  // Antes de cada prueba, limpiamos la base de datos para no arrastrar datos
  beforeEach(() => {
    db.clear();
  });

  test("Debe registrar un payaso nuevo y guardarlo en la base de datos", async () => {
    // 1. Ejecutamos la acción en el servicio
    const result = await registerPayaso("Ana López", "ana@payaso.com");

    // 2. Comprobamos la respuesta del servicio
    expect(result).toHaveProperty("id");
    expect(result.name).toBe("Ana López");
    expect(result.email).toBe("ana@payaso.com");

    // 3. LA CLAVE DE LA INTEGRACIÓN: Vamos a la base de datos real
    // para comprobar que el servicio guardó los datos correctamente allí.
    const payasoInDb = await db.findPayasoByEmail("ana@payaso.com");
    expect(payasoInDb).not.toBeNull();
    expect(payasoInDb.name).toBe("Ana López");
  });

  test("Debe lanzar un error si intentamos registrar un email duplicado", async () => {
    // 1. Preparamos el entorno insertando un payaso primero
    await registerPayaso("Carlos Perez", "carlos@payaso.com");

    // 2. Intentamos registrar a otro payaso con el mismo email
    // Usamos rejects.toThrow para capturar errores asíncronos en Jest
    await expect(
      registerPayaso("Carlos Falso", "carlos@payaso.com"),
    ).rejects.toThrow("El payaso ya está registrado con ese email");
  });

  test("Debe lanzar un error si faltan datos y no tocar la base de datos", async () => {
    // 1. Intentamos registrar sin email
    await expect(registerPayaso("Solo Nombre", null)).rejects.toThrow(
      "El nombre y el email son obligatorios",
    );

    // 2. Verificamos que la base de datos sigue vacía (no se insertó nada por error)
    // Para ello insertamos temporalmente un método para contar, o buscamos uno que no debe existir
    const payasoInDb = await db.findPayasoByEmail(null);
    expect(payasoInDb).toBeNull();
  });
});
