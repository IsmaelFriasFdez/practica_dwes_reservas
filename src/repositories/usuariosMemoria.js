// Repositorio de usuarios en memoria.
export function crearRepositorioUsuarios(iniciales = []) {
  const datos = new Map(iniciales.map((u) => [u.id, { ...u }]));

  return {
    async buscarPorId(id) {
      const usuario = datos.get(id);
      return usuario ? { ...usuario } : undefined;
    },
    async buscarPorEmail(email) {
      const usuario = [...datos.values()].find((u) => u.email === email);
      return usuario ? { ...usuario } : undefined;
    },
    async crear(valores) {
      const id = datos.size === 0 ? 1 : Math.max(...datos.keys()) + 1;
      const usuario = { id, ...valores };
      datos.set(id, usuario);
      return { ...usuario };
    }
  };
}
