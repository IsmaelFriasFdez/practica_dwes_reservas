// Implementación de RepositorioReservas en memoria usando Map.
// Se devuelven copias para que nadie modifique el estado interno sin pasar por guardar.
import type { NuevaReserva, Reserva } from "./modelos.js";
import type { RepositorioReservas } from "./RepositorioReservas.js";

export class RepositorioReservasMemoria implements RepositorioReservas {
  private readonly datos: Map<number, Reserva>;

  constructor(iniciales: Reserva[] = []) {
    this.datos = new Map(iniciales.map((r) => [r.id, { ...r }]));
  }

  async listar(): Promise<Reserva[]> {
    return [...this.datos.values()].map((r) => ({ ...r }));
  }

  async buscarPorId(id: number): Promise<Reserva | undefined> {
    const reserva = this.datos.get(id);
    return reserva ? { ...reserva } : undefined;
  }

  async listarPorUsuario(usuarioId: number): Promise<Reserva[]> {
    const todas = await this.listar();
    return todas.filter((r) => r.usuarioId === usuarioId);
  }

  async crear(datos: NuevaReserva): Promise<Reserva> {
    const id = this.datos.size === 0 ? 1 : Math.max(...this.datos.keys()) + 1;
    const reserva: Reserva = { id, ...datos };
    this.datos.set(id, reserva);
    return { ...reserva };
  }

  async guardar(reserva: Reserva): Promise<void> {
    if (!this.datos.has(reserva.id)) {
      throw new Error("No existe el registro que actualizar");
    }
    this.datos.set(reserva.id, { ...reserva });
  }
}
