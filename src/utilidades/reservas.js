// Funciones puras sobre reservas.

export const TURNOS = ["manana", "tarde"];

// Fecha de hoy en formato AAAA-MM-DD según la hora local del servidor.
export function hoyISO(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Formato AAAA-MM-DD y fecha real (rechaza, por ejemplo, 2027-02-30).
export function esFechaValida(texto) {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(texto)) return false;
  const [anio, mes, dia] = texto.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio
    && fecha.getUTCMonth() === mes - 1
    && fecha.getUTCDate() === dia;
}

// Normalizar reserva
export function normalizarReserva(entrada = {}) {
  return {
    equipoId: String(entrada.equipoId ?? "").trim(),
    fecha: String(entrada.fecha ?? "").trim(),
    turno: String(entrada.turno ?? "").trim()
  };
}

// Fecha y turno 
export function validarFechaYTurno(valores, hoy = hoyISO()) {
  const errores = {};
  if (!esFechaValida(valores.fecha)) {
    errores.fecha = "Indica una fecha válida";
  } else if (valores.fecha < hoy) {
    // Las fechas AAAA-MM-DD se pueden comparar como texto: el orden coincide.
    errores.fecha = "La fecha no puede ser anterior a hoy";
  }
  if (!TURNOS.includes(valores.turno)) {
    errores.turno = "El turno debe ser mañana o tarde";
  }
  return errores;
}

// Devuelve un objeto de errores con el nombre del campo como clave (vacío si todo es correcto).
export function validarReserva(datos, hoy = hoyISO()) {
  const errores = validarFechaYTurno(datos, hoy);
  if (!/^[1-9]\d*$/.test(datos.equipoId) || !Number.isSafeInteger(Number(datos.equipoId))) {
    errores.equipoId = "Selecciona un equipo válido";
  }
  return errores;
}

// Comprueba reserva 
export function estaReservado(equipoId, fecha, turno, reservas) {
  return reservas.some((reserva) =>
    reserva.equipoId === equipoId
    && reserva.fecha === fecha
    && reserva.turno === turno
    && reserva.estado === "activa"
  );
}

// Equipos operativos sin reserva activa en esa fecha y turno.
export function obtenerEquiposDisponibles(equipos, reservas, fecha, turno) {
  return equipos.filter((equipo) =>
    equipo.estado === "operativo" && !estaReservado(equipo.id, fecha, turno, reservas)
  );
}
