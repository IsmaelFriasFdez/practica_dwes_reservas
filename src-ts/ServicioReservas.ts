// Núcleo tipado de la gestión de reservas. El repositorio se recibe en el
// constructor (inyección de dependencias).
import type { Equipo, Reserva, Turno, Usuario } from "./modelos.js";
import type { RepositorioReservas } from "./RepositorioReservas.js";
import { ErrorDominio } from "./ErrorDominio.js";

export class ServicioReservas {
  private readonly repositorio: RepositorioReservas;

  constructor(repositorio: RepositorioReservas) {
    this.repositorio = repositorio;
  }

  async estaReservado(equipoId: number, fecha: string, turno: Turno): Promise<boolean> {
    const reservas = await this.repositorio.listar();
    return reservas.some((r) => r.equipoId === equipoId && r.fecha === fecha
      && r.turno === turno && r.estado === "activa");
  }

  async obtenerEquiposDisponibles(equipos: Equipo[], fecha: string,
    turno: Turno): Promise<Equipo[]> {
    const disponibles: Equipo[] = [];
    for (const equipo of equipos) {
      if (equipo.estado === "operativo"
          && !(await this.estaReservado(equipo.id, fecha, turno))) {
        disponibles.push(equipo);
      }
    }
    return disponibles;
  }

  async reservar(equipo: Equipo, fecha: string, turno: Turno,
    usuario: Usuario, hoy: string): Promise<Reserva> {
    if (fecha < hoy) {
      throw new ErrorDominio("DATOS_INVALIDOS", "La fecha no puede ser anterior a hoy.");
    }
    if (equipo.estado !== "operativo") {
      throw new ErrorDominio("NO_OPERATIVO", "El equipo no está operativo.");
    }
    if (await this.estaReservado(equipo.id, fecha, turno)) {
      throw new ErrorDominio("YA_RESERVADO",
        "El equipo ya está reservado para esa fecha y turno.");
    }
    return this.repositorio.crear({
      equipoId: equipo.id, usuarioId: usuario.id, fecha, turno, estado: "activa"
    });
  }

  async reservasDeUsuario(usuario: Usuario): Promise<Reserva[]> {
    return this.repositorio.listarPorUsuario(usuario.id);
  }

  async cancelar(reservaId: number, usuario: Usuario, hoy: string): Promise<Reserva> {
    const reserva = await this.repositorio.buscarPorId(reservaId);
    if (!reserva) {
      throw new ErrorDominio("NO_ENCONTRADO", "La reserva no existe.");
    }
    const esAdmin = usuario.rol === "admin";
    if (!esAdmin && reserva.usuarioId !== usuario.id) {
      throw new ErrorDominio("SIN_PERMISO", "No puedes cancelar una reserva de otro usuario.");
    }
    if (reserva.estado !== "activa") {
      throw new ErrorDominio("YA_CANCELADA", "La reserva ya está cancelada.");
    }
    if (!esAdmin && reserva.fecha < hoy) {
      throw new ErrorDominio("FECHA_PASADA", "No se puede cancelar una reserva pasada.");
    }
    const actualizada: Reserva = { ...reserva, estado: "cancelada" };
    await this.repositorio.guardar(actualizada);
    return actualizada;
  }
}
