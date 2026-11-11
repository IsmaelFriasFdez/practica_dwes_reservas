import { Router } from "express";

// Rutas públicas del catálogo.
export function crearRutasEquipos(controlador) {
  const router = Router();
  router.get("/equipos", controlador.catalogo);
  router.get("/equipos/:id", controlador.detalle);
  return router;
}
