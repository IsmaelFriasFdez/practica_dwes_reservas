import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { nuevaApp, USUARIOS, agenteConSesion, extraerCsrf } from "./ayudantes.js";

describe("registro y autenticación", () => {
  let app;
  beforeEach(() => {
    app = nuevaApp();
  });

  it("1. registra un usuario válido", async () => {
    const agente = request.agent(app);
    const respuesta = await agente.post("/registro").type("form").send({
      nombre: "Marta López",
      email: "marta@example.com",
      password: "Marta1234",
      rol: "admin" // el registro público siempre asigna el rol usuario
    });
    expect(respuesta.status).toBe(303);
    expect(respuesta.headers.location).toBe("/login");

    await agente.post("/login").type("form")
      .send({ email: "marta@example.com", password: "Marta1234" }).expect(303);
    const perfil = await agente.get("/perfil");
    expect(perfil.status).toBe(200);
    expect(perfil.text).toContain("Marta López");
    expect(perfil.text).toContain("usuario");
  });

  it("2. rechaza credenciales incorrectas", async () => {
    const respuesta = await request(app).post("/login").type("form")
      .send({ email: USUARIOS.ana.email, password: "incorrecta" });
    expect(respuesta.status).toBe(401);
    expect(respuesta.text).toContain("Credenciales no válidas");
  });

  it("3. no permite acceder a una ruta privada sin autenticación", async () => {
    const respuesta = await request(app).get("/perfil");
    expect(respuesta.status).toBe(303);
    expect(respuesta.headers.location).toBe("/login");
  });

  it("4. permite acceder a una ruta privada con sesión", async () => {
    const { agente } = await agenteConSesion(app, USUARIOS.ana);
    const respuesta = await agente.get("/mis-reservas");
    expect(respuesta.status).toBe(200);
    expect(respuesta.text).toContain("Mis reservas");
  });
});
