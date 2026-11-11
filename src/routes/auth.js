import { Router } from "express";

// Rutas de registro, acceso, cierre de sesión y perfil.
export function crearRutasAuth(controlador, { exigirAutenticacion, verificarCsrf, limitarLogin }) {
  const router = Router();
  router.get("/registro", controlador.mostrarRegistro);
  router.post("/registro", controlador.registrar);
  router.get("/login", controlador.mostrarLogin);
  router.post("/login", limitarLogin, controlador.login);
  // POST con token CSRF: un enlace o una página externa no pueden cerrar la sesión.
  router.post("/logout", verificarCsrf, controlador.logout);
  router.get("/perfil", exigirAutenticacion, controlador.perfil);
  return router;
}
