// Controlador de administración: equipos y todas las reservas.
import { normalizarEquipo, validarEquipo } from "../utilidades/equipos.js";
import { enteroPositivo } from "../http/enteroPositivo.js";
import { redirigirConAviso } from "../http/avisos.js";

export function crearControladorAdmin(servicioEquipos, servicioReservas) {
  async function renderEquipos(res, estado, valores, errores) {
    const equipos = await servicioEquipos.listar();
    return res.status(estado).render("admin/equipos", {
      tituloPagina: "Administrar equipos",
      equipos,
      valores,
      errores
    });
  }

  return {
    async listarEquipos(req, res, next) {
      try {
        const valores = { codigo: "", nombre: "", tipo: "sobremesa", estado: "operativo" };
        return await renderEquipos(res, 200, valores, {});
      } catch (err) {
        return next(err);
      }
    },

    async crearEquipo(req, res, next) {
      try {
        const valores = normalizarEquipo(req.body);
        const errores = validarEquipo(valores);
        if (Object.keys(errores).length > 0) {
          return await renderEquipos(res, 400, valores, errores);
        }
        const creado = await servicioEquipos.crear(valores);
        return redirigirConAviso(req, res, next,
          `Equipo ${creado.codigo} añadido.`, "/admin/equipos");
      } catch (err) {
        return next(err);
      }
    },

    async cambiarEstado(req, res, next) {
      try {
        const id = enteroPositivo(req.params.id, "id");
        const estado = String(req.body.estado ?? "");
        const equipo = await servicioEquipos.cambiarEstado(id, estado);
        return redirigirConAviso(req, res, next,
          `Estado de ${equipo.codigo} actualizado.`, "/admin/equipos");
      } catch (err) {
        return next(err);
      }
    },

    async listarReservas(req, res, next) {
      try {
        const reservas = await servicioReservas.todasLasReservas(req.usuario);
        return res.render("admin/reservas", { tituloPagina: "Todas las reservas", reservas });
      } catch (err) {
        return next(err);
      }
    },

    async cancelarReserva(req, res, next) {
      try {
        const id = enteroPositivo(req.params.id, "id");
        await servicioReservas.cancelar(id, req.usuario);
        return redirigirConAviso(req, res, next, `Reserva ${id} cancelada.`, "/admin/reservas");
      } catch (err) {
        return next(err);
      }
    }
  };
}
