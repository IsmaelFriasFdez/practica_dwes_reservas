// Registro y autenticación. Recibe valores ya normalizados y validados por el controlador.
import bcrypt from "bcrypt";
import { ErrorDominio } from "../domain/Errores.js";

export function crearServicioUsuarios(repoUsuarios) {
  return {
    async registrar({ nombre, email, password }) {
      if (await repoUsuarios.buscarPorEmail(email)) {
        throw new ErrorDominio("EMAIL_DUPLICADO", "No se puede crear la cuenta");
      }
      const passwordHash = await bcrypt.hash(password, 10);
      // El rol lo fija el servidor: el registro público siempre crea usuarios normales.
      return repoUsuarios.crear({ nombre, email, passwordHash, rol: "usuario" });
    },

    // Devuelve el usuario si las credenciales son correctas
    async autenticar(email, password) {
      const usuario = await repoUsuarios.buscarPorEmail(email);
      const coincide = usuario
        ? await bcrypt.compare(password, usuario.passwordHash)
        : false;
      return coincide ? usuario : null;
    },

    async buscarPorId(id) {
      return repoUsuarios.buscarPorId(id);
    }
  };
}
