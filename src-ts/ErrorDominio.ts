// Versión tipada del error de dominio de src/domain/Errores.js.
export type CodigoError = "DATOS_INVALIDOS" | "SIN_PERMISO" | "NO_ENCONTRADO"
  | "NO_OPERATIVO" | "YA_RESERVADO" | "YA_CANCELADA" | "FECHA_PASADA";

export class ErrorDominio extends Error {
  readonly codigo: CodigoError;

  constructor(codigo: CodigoError, mensaje: string) {
    super(mensaje);
    this.name = "ErrorDominio";
    this.codigo = codigo;
  }
}
