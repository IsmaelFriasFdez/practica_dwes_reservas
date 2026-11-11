// Middleware de identidad, autenticación y autorización.

export function crearCargarUsuarioActual(servicioUsuarios) {
  return async function cargarUsuarioActual(req, res, next) {
    try {
      const usuarioId = req.session.usuarioId;
      const usuario = usuarioId ? await servicioUsuarios.buscarPorId(usuarioId) : null;
      const usuarioActual = usuario
        ? { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        : null;
      req.usuario = usuarioActual;
      res.locals.usuarioActual = usuarioActual;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

export function exigirAutenticacion(req, res, next) {
  if (!res.locals.usuarioActual) {
    return res.redirect(303, "/login");
  }
  return next();
}

// Fábrica de middleware: recibe los roles permitidos y devuelve la comprobación.
export function exigirRol(...rolesPermitidos) {
  return (req, res, next) => {
    const usuario = res.locals.usuarioActual;
    if (!usuario) {
      return res.redirect(303, "/login");
    }
    if (!rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).render("error", {
        tituloPagina: "Acceso denegado",
        mensaje: "No tienes permiso para acceder"
      });
    }
    return next();
  };
}
