// Error de dominio
export class ErrorDominio extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.name = "ErrorDominio";
    this.codigo = codigo;
  }
}
