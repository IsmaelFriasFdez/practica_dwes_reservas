// Repositorio de reservas en memoria. 
export function crearRepositorioReservas(iniciales = []) {
  const datos = new Map(iniciales.map((r) => [r.id, { ...r }]));

  return {
    async listar() {
      return [...datos.values()].map((r) => ({ ...r }));
    },
    async listarPorUsuario(usuarioId) {
      return [...datos.values()]
        .filter((r) => r.usuarioId === usuarioId)
        .map((r) => ({ ...r }));
    },
    async buscarPorId(id) {
      const reserva = datos.get(id);
      return reserva ? { ...reserva } : undefined;
    },
    async crear(valores) {
      const id = datos.size === 0 ? 1 : Math.max(...datos.keys()) + 1;
      const reserva = { id, ...valores };
      datos.set(id, reserva);
      return { ...reserva };
    },
    async guardar(reserva) {
      if (!datos.has(reserva.id)) {
        throw new Error("No existe el registro que actualizar");
      }
      datos.set(reserva.id, { ...reserva });
    }
  };
}
