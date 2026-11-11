// Traducción de errores de dominio a respuestas HTTP.
import { ErrorDominio } from "../domain/Errores.js";

const estados = {
  DATOS_INVALIDOS: 400,
  EMAIL_DUPLICADO: 400,
  SIN_PERMISO: 403,
  NO_ENCONTRADO: 404,
  NO_OPERATIVO: 409,
  YA_RESERVADO: 409,
  YA_CANCELADA: 409,
  FECHA_PASADA: 409
};

// Devuelve el código HTTP de un error de dominio conocido, o null.
export function estadoDeError(err) {
  return err instanceof ErrorDominio ? estados[err.codigo] ?? null : null;
}

export function noEncontrado(req, res) {
  return res.status(404).render("error", {
    tituloPagina: "Página no encontrada",
    mensaje: "Página no encontrada"
  });
}

// Middleware de errores: Express lo reconoce por sus cuatro parámetros.
export function tratarError(err, req, res, next) {
  if (res.headersSent) return next(err);

  const estado = estadoDeError(err);
  if (estado) {
    return res.status(estado).render("error", {
      tituloPagina: "No se pudo completar la operación",
      mensaje: err.message
    });
  }

  // Fallo inesperado: el detalle técnico solo va a la consola, nunca al cliente.
  if (process.env.NODE_ENV !== "test") {
    console.error("Fallo interno al procesar una petición:", err);
  }
  return res.status(500).render("error", {
    tituloPagina: "Error interno",
    mensaje: "No se ha podido completar la operación."
  });
}
