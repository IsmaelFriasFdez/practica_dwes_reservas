// Repositorio de equipos en memoria. 
export function crearRepositorioEquipos(iniciales = []) {
  const datos = new Map(iniciales.map((e) => [e.id, { ...e }]));

  return {
    async listar() {
      return [...datos.values()].map((e) => ({ ...e }));
    },
    async buscarPorId(id) {
      const equipo = datos.get(id);
      return equipo ? { ...equipo } : undefined;
    },
    async crear(valores) {
      const id = datos.size === 0 ? 1 : Math.max(...datos.keys()) + 1;
      const equipo = { id, ...valores };
      datos.set(id, equipo);
      return { ...equipo };
    },
    async guardar(equipo) {
      if (!datos.has(equipo.id)) {
        throw new Error("No existe el registro que actualizar");
      }
      datos.set(equipo.id, { ...equipo });
    }
  };
}
