// Controlador del catálogo público y de la ficha de cada equipo.
import { normalizarFiltros, TIPOS } from "../utilidades/equipos.js";
import { enteroPositivo } from "../http/enteroPositivo.js";

const COOKIE_TIPO = "tipoPreferido";

export function crearControladorEquipos(servicio, { produccion }) {
  return {
    async catalogo(req, res, next) {
      try {
        const filtros = normalizarFiltros(req.query, req.cookies[COOKIE_TIPO]);
        if (filtros.error) {
          return res.status(400).render("error", {
            tituloPagina: "Filtro no válido", mensaje: filtros.error
          });
        }

        // Cookie de preferencias.
        if (TIPOS.includes(req.query.tipo)) {
          res.cookie(COOKIE_TIPO, req.query.tipo, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: produccion
          });
        }

        const equipos = await servicio.listar(filtros);
        return res.render("equipos/catalogo", {
          tituloPagina: "Catálogo de equipos",
          equipos,
          filtros: { tipo: filtros.tipo ?? "", soloOperativos: filtros.soloOperativos }
        });
      } catch (err) {
        return next(err);
      }
    },

    async detalle(req, res, next) {
      try {
        const id = enteroPositivo(req.params.id, "id");
        const equipo = await servicio.obtener(id);
        return res.render("equipos/detalle", { tituloPagina: equipo.nombre, equipo });
      } catch (err) {
        return next(err);
      }
    }
  };
}
