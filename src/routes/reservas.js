import { Router } from "express";

// Rutas de reservas del usuario autenticado. El orden importa: primero se exige
// la sesión, después el token CSRF y solo entonces se ejecuta el controlador.
export function crearRutasReservas(controlador, { exigirAutenticacion, verificarCsrf }) {
  const router = Router();
  router.get("/reservas/nueva", exigirAutenticacion, controlador.mostrarFormulario);
  router.post("/reservas", exigirAutenticacion, verificarCsrf, controlador.crear);
  router.get("/mis-reservas", exigirAutenticacion, controlador.misReservas);
  router.post("/reservas/:id/cancelar", exigirAutenticacion, verificarCsrf, controlador.cancelar);
  return router;
}
