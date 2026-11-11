import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { nuevaApp, USUARIOS, agenteConSesion } from "./ayudantes.js";

describe("administración y CSRF", () => {
  let app;
  beforeEach(() => {
    app = nuevaApp();
  });

  it("5. rechaza una operación de administrador realizada por un usuario ordinario", async () => {
    const { agente, csrf } = await agenteConSesion(app, USUARIOS.ana);
    await agente.post("/admin/equipos/1/estado").type("form")
      .send({ _csrf: csrf, estado: "fuera_de_servicio" })
      .expect(403);
  });
});
