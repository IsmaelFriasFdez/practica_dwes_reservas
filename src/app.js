// Composición de la aplicación
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

import { config } from "./config.js";
import { equiposIniciales, reservasIniciales, usuariosIniciales } from "./datos/iniciales.js";
import { crearRepositorioEquipos } from "./repositories/equiposMemoria.js";
import { crearRepositorioReservas } from "./repositories/reservasMemoria.js";
import { crearRepositorioUsuarios } from "./repositories/usuariosMemoria.js";
import { crearServicioEquipos } from "./services/equipos.js";
import { crearServicioReservas } from "./services/reservas.js";
import { crearServicioUsuarios } from "./services/usuarios.js";
import { crearControladorEquipos } from "./controllers/equipos.js";
import { crearControladorAuth } from "./controllers/auth.js";
import { crearControladorReservas } from "./controllers/reservas.js";
import { crearControladorAdmin } from "./controllers/admin.js";
import { crearRutasEquipos } from "./routes/equipos.js";
import { crearRutasAuth } from "./routes/auth.js";
import { crearRutasReservas } from "./routes/reservas.js";
import { crearRutasAdmin } from "./routes/admin.js";
import { crearCargarUsuarioActual, exigirAutenticacion, exigirRol } from "./middleware/autenticacion.js";
import { prepararCsrf, verificarCsrf } from "./middleware/csrf.js";
import { consumirAviso } from "./http/avisos.js";
import { noEncontrado, tratarError } from "./http/tratarError.js";

// Nombre por defecto de la cookie de express-session (necesario para retirarla en el logout).
const NOMBRE_COOKIE = "connect.sid";

// Cada llamada crea una aplicación con sus propios datos en memoria.
export function crearApp() {
  const app = express();
  app.set("view engine", "ejs");
  app.set("views", "views");

  // Valores por defecto para las vistas
  app.use((req, res, next) => {
    res.locals.usuarioActual = null;
    res.locals.csrfToken = "";
    res.locals.aviso = null;
    return next();
  });

  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static("public"));

  const opcionesCookie = {
    httpOnly: true,
    secure: config.produccion,
    sameSite: "lax"
  };
  app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { ...opcionesCookie, maxAge: 30 * 60 * 1000 }
  }));

  // Repositorios
  const repoEquipos = crearRepositorioEquipos(equiposIniciales);
  const repoReservas = crearRepositorioReservas(reservasIniciales);
  const repoUsuarios = crearRepositorioUsuarios(usuariosIniciales);

  // Servicios
  const servicioEquipos = crearServicioEquipos(repoEquipos);
  const servicioReservas = crearServicioReservas({ repoReservas, repoEquipos });
  const servicioUsuarios = crearServicioUsuarios(repoUsuarios);

  // Middleware
  app.use(crearCargarUsuarioActual(servicioUsuarios));
  app.use(prepararCsrf);
  app.use(consumirAviso);

  const limitarLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Demasiados intentos. Prueba más tarde."
  });

  const controladorEquipos = crearControladorEquipos(servicioEquipos, config);
  const controladorAuth = crearControladorAuth(servicioUsuarios, {
    nombre: NOMBRE_COOKIE, opciones: opcionesCookie
  });
  const controladorReservas = crearControladorReservas(servicioReservas);
  const controladorAdmin = crearControladorAdmin(servicioEquipos, servicioReservas);

  app.use(crearRutasEquipos(controladorEquipos));
  app.use(crearRutasAuth(controladorAuth, { exigirAutenticacion, verificarCsrf, limitarLogin }));
  app.use(crearRutasReservas(controladorReservas, { exigirAutenticacion, verificarCsrf }));
  app.use("/admin", crearRutasAdmin(controladorAdmin, { exigirRol, verificarCsrf }));

  // Después de todas las rutas: 404 y tratamiento centralizado de errores.
  app.use(noEncontrado);
  app.use(tratarError);

  return app;
}

export const app = crearApp();
