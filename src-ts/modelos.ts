// Tipos del dominio. Las uniones de literales limitan los valores permitidos.
export type Rol = "usuario" | "admin";
export type Turno = "manana" | "tarde";
export type EstadoReserva = "activa" | "cancelada";
export type EstadoEquipo = "operativo" | "fuera_de_servicio";
export type TipoEquipo = "portatil" | "sobremesa";

export interface Equipo {
  readonly id: number;
  codigo: string;
  nombre: string;
  tipo: TipoEquipo;
  estado: EstadoEquipo;
}

export interface Reserva {
  readonly id: number;
  equipoId: number;
  usuarioId: number;
  fecha: string; // AAAA-MM-DD
  turno: Turno;
  estado: EstadoReserva;
}

export interface Usuario {
  readonly id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

// Datos para crear una reserva: el id lo asigna el repositorio.
export type NuevaReserva = Omit<Reserva, "id">;
