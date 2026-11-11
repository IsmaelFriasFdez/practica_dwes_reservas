// Controlador de registro, inicio y cierre de sesión y perfil.
import { ErrorDominio } from "../domain/Errores.js";
import { normalizarRegistro, validarRegistro, normalizarLogin } from "../utilidades/usuarios.js";
import { redirigirConAviso } from "../http/avisos.js";

// Tras autenticar se regenera el identificador de sesión.
function iniciarSesion(req, res, next, usuario) {
  req.session.regenerate((error) => {
    if (error) return next(error);
    req.session.usuarioId = usuario.id;
    req.session.save((saveError) => {
      if (saveError) return next(saveError);
      return res.redirect(303, "/perfil");
    });
  });
}

export function crearControladorAuth(servicioUsuarios, cookieSesion) {
  return {
    mostrarRegistro(req, res) {
      return res.render("auth/registro", {
        tituloPagina: "Registro",
        valores: { nombre: "", email: "" },
        errores: {}
      });
    },

    async registrar(req, res, next) {
      try {
        const valores = normalizarRegistro(req.body);
        const errores = validarRegistro(valores);
        // La contraseña nunca se devuelve a la vista.
        const valoresVista = { nombre: valores.nombre, email: valores.email };

        if (Object.keys(errores).length > 0) {
          return res.status(400).render("auth/registro", {
            tituloPagina: "Registro", valores: valoresVista, errores
          });
        }

        try {
          await servicioUsuarios.registrar(valores);
        } catch (err) {
          if (err instanceof ErrorDominio && err.codigo === "EMAIL_DUPLICADO") {
            return res.status(400).render("auth/registro", {
              tituloPagina: "Registro",
              valores: valoresVista,
              errores: { email: err.message }
            });
          }
          throw err;
        }

        return redirigirConAviso(req, res, next,
          "Registro completado. Ya puedes iniciar sesión.", "/login");
      } catch (err) {
        return next(err);
      }
    },

    mostrarLogin(req, res) {
      return res.render("auth/login", {
        tituloPagina: "Iniciar sesión",
        valores: { email: "" },
        error: null
      });
    },

    async login(req, res, next) {
      try {
        const valores = normalizarLogin(req.body);
        const usuario = await servicioUsuarios.autenticar(valores.email, valores.password);

        // Mismo mensaje si no existe la cuenta o si la contraseña no coincide.
        if (!usuario) {
          return res.status(401).render("auth/login", {
            tituloPagina: "Iniciar sesión",
            valores: { email: valores.email },
            error: "Credenciales no válidas"
          });
        }
        return iniciarSesion(req, res, next, usuario);
      } catch (err) {
        return next(err);
      }
    },

    // Se destruye la sesión en el servidor y se retira la cookie del navegador.
    logout(req, res, next) {
      req.session.destroy((error) => {
        if (error) return next(error);
        res.clearCookie(cookieSesion.nombre, cookieSesion.opciones);
        return res.redirect(303, "/login");
      });
    },

    perfil(req, res) {
      return res.render("auth/perfil", {
        tituloPagina: "Mi perfil",
        usuario: req.usuario
      });
    }
  };
}
