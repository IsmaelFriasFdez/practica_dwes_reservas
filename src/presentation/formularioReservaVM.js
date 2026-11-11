// Modelo de vista del formulario de reservas.
import { hoyISO } from "../utilidades/reservas.js";

const TURNOS = [
  { valor: "manana", texto: "Mañana" },
  { valor: "tarde", texto: "Tarde" }
];

export function crearFormularioReservaVM({
  equipos = null, // null: todavía no se han elegido fecha y turno válidos
  csrfToken,
  valores = { equipoId: "", fecha: "", turno: "" },
  errores = []
}) {
  const consultado = Array.isArray(equipos);
  return {
    titulo: "Nueva reserva",
    fechaMinima: hoyISO(),
    turnos: TURNOS,
    consultado,
    equipos: consultado
      ? equipos.map((e) => ({ valor: String(e.id), texto: `${e.codigo} - ${e.nombre}` }))
      : [],
    puedeEnviar: consultado && equipos.length > 0,
    csrfToken,
    valores,
    errores
  };
}
