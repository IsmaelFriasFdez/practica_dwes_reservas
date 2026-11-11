// Casos de uso de equipos. No conoce req, res ni EJS.
import { ErrorDominio } from "../domain/Errores.js";
import { ESTADOS, filtrarEquipos } from "../utilidades/equipos.js";

export function crearServicioEquipos(repoEquipos) {
  return {
    async listar({ tipo = null, soloOperativos = false } = {}) {
      const equipos = await repoEquipos.listar();
      return filtrarEquipos(equipos, tipo, soloOperativos);
    },

    async obtener(id) {
      const equipo = await repoEquipos.buscarPorId(id);
      if (!equipo) {
        throw new ErrorDominio("NO_ENCONTRADO", "El equipo no existe.");
      }
      return equipo;
    },

    async crear(valores) {
      return repoEquipos.crear(valores);
    },

    async cambiarEstado(id, estado) {
      if (!ESTADOS.includes(estado)) {
        throw new ErrorDominio("DATOS_INVALIDOS", "Estado no válido.");
      }
      const equipo = await this.obtener(id);
      const actualizado = { ...equipo, estado };
      await repoEquipos.guardar(actualizado);
      return actualizado;
    }
  };
}
