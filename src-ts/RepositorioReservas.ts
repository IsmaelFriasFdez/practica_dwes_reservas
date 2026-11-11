// Contrato de acceso a las reservas. El servicio depende de esta interfaz,
// no de una implementación concreta.
import type { NuevaReserva, Reserva } from "./modelos.js";

export interface RepositorioReservas {
  listar(): Promise<Reserva[]>;
  buscarPorId(id: number): Promise<Reserva | undefined>;
  listarPorUsuario(usuarioId: number): Promise<Reserva[]>;
  crear(datos: NuevaReserva): Promise<Reserva>;
  guardar(reserva: Reserva): Promise<void>;
}
