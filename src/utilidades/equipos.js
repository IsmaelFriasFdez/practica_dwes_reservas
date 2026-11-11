// Normalización y validación de equipos y de los filtros del catálogo.

export const TIPOS = ["portatil", "sobremesa"];
export const ESTADOS = ["operativo", "fuera_de_servicio"];

export function normalizarEquipo(body = {}) {
  return {
    codigo: String(body.codigo ?? "").trim().toUpperCase(),
    nombre: String(body.nombre ?? "").trim(),
    tipo: String(body.tipo ?? "").trim(),
    estado: String(body.estado ?? "").trim()
  };
}

export function validarEquipo(valores) {
  const errores = {};
  if (!/^[A-Z0-9-]{3,20}$/.test(valores.codigo)) {
    errores.codigo = "El código debe tener de 3 a 20 letras, números o guiones";
  }
  if (valores.nombre.length < 2 || valores.nombre.length > 80) {
    errores.nombre = "El nombre debe tener entre 2 y 80 caracteres";
  }
  if (!TIPOS.includes(valores.tipo)) {
    errores.tipo = "El tipo debe ser portátil o sobremesa";
  }
  if (!ESTADOS.includes(valores.estado)) {
    errores.estado = "El estado debe ser operativo o fuera de servicio";
  }
  return errores;
}

// Filtros del catálogo. 
export function normalizarFiltros(query, tipoPreferido) {
  const tipoQuery = query.tipo === undefined ? undefined : String(query.tipo).trim();
  const operativos = String(query.operativos ?? "");

  if (tipoQuery && !TIPOS.includes(tipoQuery)) {
    return { error: "El tipo debe ser portatil o sobremesa" };
  }
  if (operativos !== "" && operativos !== "true") {
    return { error: "El parámetro operativos solo admite el valor true" };
  }

  let tipo = null;
  if (tipoQuery) {
    tipo = tipoQuery;
  } else if (tipoQuery === undefined && TIPOS.includes(tipoPreferido)) {
    tipo = tipoPreferido;
  }
  return { tipo, soloOperativos: operativos === "true", error: null };
}

export function filtrarEquipos(equipos, tipo, soloOperativos) {
  let resultado = equipos;
  if (tipo) {
    resultado = resultado.filter((equipo) => equipo.tipo === tipo);
  }
  if (soloOperativos) {
    resultado = resultado.filter((equipo) => equipo.estado === "operativo");
  }
  return resultado;
}
