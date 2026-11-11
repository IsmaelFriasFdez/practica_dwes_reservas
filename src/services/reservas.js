// Casos de uso de reservas
import { ErrorDominio } from "../domain/Errores.js";
import {
  hoyISO,
  esFechaValida,
  TURNOS,
  estaReservado,
  obtenerEquiposDisponibles
} from "../utilidades/reservas.js";

export function crearServicioReservas({ repoReservas, repoEquipos }) {
  // Añade a cada reserva los datos de su equipo y si el usuario puede cancelarla.
  async function completar(reservas, usuario, hoy) {
    const equipos = await repoEquipos.listar();
    return reservas.map((reserva) => ({
      ...reserva,
      equipo: equipos.find((e) => e.id === reserva.equipoId),
      puedeCancelar: reserva.estado === "activa"
        && (usuario.rol === "admin" || reserva.fecha >= hoy)
    }));
  }

  return {
    async equiposDisponibles(fecha, turno) {
      const equipos = await repoEquipos.listar();
      const reservas = await repoReservas.listar();
      return obtenerEquiposDisponibles(equipos, reservas, fecha, turno);
    },

    
    async reservar({ equipoId, fecha, turno }, usuario, hoy = hoyISO()) {
      if (!Number.isSafeInteger(equipoId) || equipoId <= 0
          || !esFechaValida(fecha) || !TURNOS.includes(turno)) {
        throw new ErrorDominio("DATOS_INVALIDOS", "Los datos de la reserva no son válidos.");
      }
      if (fecha < hoy) {
        throw new ErrorDominio("DATOS_INVALIDOS", "La fecha no puede ser anterior a hoy.");
      }

      const equipo = await repoEquipos.buscarPorId(equipoId);
      if (!equipo) {
        throw new ErrorDominio("NO_ENCONTRADO", "El equipo no existe.");
      }
      if (equipo.estado !== "operativo") {
        throw new ErrorDominio("NO_OPERATIVO", "El equipo no está operativo.");
      }

      const reservas = await repoReservas.listar();
      if (estaReservado(equipoId, fecha, turno, reservas)) {
        throw new ErrorDominio("YA_RESERVADO", "El equipo ya está reservado para esa fecha y turno.");
      }

      return repoReservas.crear({
        equipoId, usuarioId: usuario.id, fecha, turno, estado: "activa"
      });
    },

    async reservasDeUsuario(usuario, hoy = hoyISO()) {
      const reservas = await repoReservas.listarPorUsuario(usuario.id);
      return completar(reservas, usuario, hoy);
    },

    async todasLasReservas(usuario, hoy = hoyISO()) {
      const reservas = await repoReservas.listar();
      return completar(reservas, usuario, hoy);
    },

    
    async cancelar(reservaId, usuario, hoy = hoyISO()) {
      const reserva = await repoReservas.buscarPorId(reservaId);
      if (!reserva) {
        throw new ErrorDominio("NO_ENCONTRADO", "La reserva no existe.");
      }
      const esAdmin = usuario.rol === "admin";
      // Comprobación de propiedad: cambiar el id de la URL no permite cancelar otra reserva.
      if (!esAdmin && reserva.usuarioId !== usuario.id) {
        throw new ErrorDominio("SIN_PERMISO", "No puedes cancelar una reserva de otro usuario.");
      }
      if (reserva.estado !== "activa") {
        throw new ErrorDominio("YA_CANCELADA", "La reserva ya está cancelada.");
      }
      if (!esAdmin && reserva.fecha < hoy) {
        throw new ErrorDominio("FECHA_PASADA", "No se puede cancelar una reserva pasada.");
      }

      const actualizada = { ...reserva, estado: "cancelada" };
      await repoReservas.guardar(actualizada);
      return actualizada;
    }
  };
}
