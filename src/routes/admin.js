import { Router } from "express";

// Rutas reservadas al rol admin (montadas en /admin). Un usuario normal recibe 403
// aunque conozca la URL o envíe la petición directamente.
export function crearRutasAdmin(controlador, { exigirRol, verificarCsrf }) {
  const router = Router();
  router.use(exigirRol("admin"));
  router.get("/equipos", controlador.listarEquipos);
  router.post("/equipos", verificarCsrf, controlador.crearEquipo);
  router.post("/equipos/:id/estado", verificarCsrf, controlador.cambiarEstado);
  router.get("/reservas", controlador.listarReservas);
  router.post("/reservas/:id/cancelar", verificarCsrf, controlador.cancelarReserva);
  return router;
}
