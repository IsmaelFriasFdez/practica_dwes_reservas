// Protección CSRF con un token impredecible vinculado a la sesión.
import crypto from "node:crypto";

export function prepararCsrf(req, res, next) {
  req.session.csrfToken ??= crypto.randomBytes(32).toString("hex");
  res.locals.csrfToken = req.session.csrfToken;
  return next();
}

export function verificarCsrf(req, res, next) {
  const esperado = String(req.session.csrfToken ?? "");
  const recibido = String(req.body?._csrf ?? "");
  const a = Buffer.from(esperado);
  const b = Buffer.from(recibido);

  if (a.length === 0 || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).render("error", {
      tituloPagina: "Petición no permitida",
      mensaje: "Petición no permitida"
    });
  }
  return next();
}
