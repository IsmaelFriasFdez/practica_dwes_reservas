// Controlador de reservas del usuario
import { normalizarReserva, validarFechaYTurno, validarReserva } from "../utilidades/reservas.js";
import { enteroPositivo } from "../http/enteroPositivo.js";
import { estadoDeError } from "../http/tratarError.js";
import { redirigirConAviso } from "../http/avisos.js";
import { crearFormularioReservaVM } from "../presentation/formularioReservaVM.js";

export function crearControladorReservas(servicio) {
  // Prepara el vm del formulario. Solo se consultan equipos si fecha y turno son válidos.
  async function construirVM(res, valores, errores = []) {
    const fechaTurnoValidos = valores.fecha && valores.turno
      && Object.keys(validarFechaYTurno(valores)).length === 0;
    const equipos = fechaTurnoValidos
      ? await servicio.equiposDisponibles(valores.fecha, valores.turno)
      : null;
    return crearFormularioReservaVM({
      equipos, csrfToken: res.locals.csrfToken, valores, errores
    });
  }

  return {
    // GET /reservas/nueva
    async mostrarFormulario(req, res, next) {
      try {
        const valores = normalizarReserva(req.query);
        let errores = {};
        if (valores.fecha || valores.turno) {
          errores = validarFechaYTurno(valores);
        }
        // Los campos con error no se conservan.
        for (const campo of Object.keys(errores)) {
          valores[campo] = "";
        }
        const vm = await construirVM(res, valores, Object.values(errores));
        return res.status(vm.errores.length > 0 ? 400 : 200).render("reservas/nueva", { vm });
      } catch (err) {
        return next(err);
      }
    },

    // POST /reservas
    async crear(req, res, next) {
      try {
        const valores = normalizarReserva(req.body);
        const errores = validarReserva(valores);

        if (Object.keys(errores).length > 0) {
          for (const campo of Object.keys(errores)) {
            valores[campo] = "";
          }
          const vm = await construirVM(res, valores, Object.values(errores));
          return res.status(400).render("reservas/nueva", { vm });
        }

        try {
          await servicio.reservar({
            equipoId: Number(valores.equipoId),
            fecha: valores.fecha,
            turno: valores.turno
          }, req.usuario);
        } catch (err) {
          const estado = estadoDeError(err);
          if (!estado) throw err;
          // Error previsto (equipo inexistente, no operativo o ya reservado)
          const vm = await construirVM(res, { ...valores, equipoId: "" }, [err.message]);
          return res.status(estado).render("reservas/nueva", { vm });
        }

        return redirigirConAviso(req, res, next, "Reserva creada correctamente.", "/mis-reservas");
      } catch (err) {
        return next(err);
      }
    },

    // GET /mis-reservas
    async misReservas(req, res, next) {
      try {
        const reservas = await servicio.reservasDeUsuario(req.usuario);
        return res.render("reservas/mis-reservas", {
          tituloPagina: "Mis reservas",
          reservas
        });
      } catch (err) {
        return next(err);
      }
    },

    // POST /reservas/:id/cancelar
    async cancelar(req, res, next) {
      try {
        const id = enteroPositivo(req.params.id, "id");
        await servicio.cancelar(id, req.usuario);
        return redirigirConAviso(req, res, next, "Reserva cancelada.", "/mis-reservas");
      } catch (err) {
        return next(err);
      }
    }
  };
}
