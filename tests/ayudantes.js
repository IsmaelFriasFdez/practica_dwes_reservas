// Utilidades compartidas por las pruebas. No se arranca ningún servidor
import request from "supertest";
import { crearApp } from "../src/app.js";

// Cada prueba usa una aplicación nueva con los datos iniciales.
export function nuevaApp() {
  return crearApp();
}

export const USUARIOS = {
  admin: { email: "admin@example.com", password: "Admin1234" },
  ana: { email: "ana@example.com", password: "Ana12345" },   // dueña de la reserva 1
  luis: { email: "luis@example.com", password: "Luis1234" }  // dueño de la reserva 2
};

// Lee el token CSRF del campo oculto _csrf de una página HTML.
export function extraerCsrf(html) {
  const encontrado = /name="_csrf" value="([^"]+)"/.exec(html);
  if (!encontrado) throw new Error("No se ha encontrado el token CSRF");
  return encontrado[1];
}

// request.agent conserva las cookies entre peticiones, como un navegador.
export async function agenteConSesion(app, { email, password }) {
  const agente = request.agent(app);
  await agente.post("/login").type("form").send({ email, password }).expect(303);
  const perfil = await agente.get("/perfil").expect(200);
  return { agente, csrf: extraerCsrf(perfil.text) };
}

// Fecha relativa a hoy en formato AAAA-MM-DD (hora local, igual que el servidor).
export function fechaRelativa(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}
