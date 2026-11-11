// Convierte un identificador recibido como texto (req.params, req.body) en número.
import { ErrorDominio } from "../domain/Errores.js";

export function enteroPositivo(valor, nombre) {
  if (typeof valor !== "string" || !/^[1-9]\d*$/.test(valor)) {
    throw new ErrorDominio("DATOS_INVALIDOS",
      `El campo ${nombre} debe ser un entero positivo.`);
  }
  const numero = Number(valor);
  if (!Number.isSafeInteger(numero)) {
    throw new ErrorDominio("DATOS_INVALIDOS",
      `El campo ${nombre} está fuera de rango.`);
  }
  return numero;
}
