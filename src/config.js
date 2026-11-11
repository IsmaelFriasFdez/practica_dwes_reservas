// Configuración mediante variables de entorno.
const entorno = process.env.NODE_ENV ?? "development";
if (!["development", "test", "production"].includes(entorno)) {
  throw new Error("NODE_ENV no válido");
}

const puertoTexto = process.env.PORT ?? "3000";
const puerto = Number(puertoTexto);
if (!/^\d+$/.test(puertoTexto) || puerto < 1 || puerto > 65535) {
  throw new Error("PORT debe estar entre 1 y 65535");
}

const secreto = process.env.SESSION_SECRET;
if (!secreto || secreto.length < 32) {
  throw new Error("SESSION_SECRET no está configurado correctamente");
}

export const config = Object.freeze({
  entorno,
  puerto,
  produccion: entorno === "production",
  sessionSecret: secreto
});
