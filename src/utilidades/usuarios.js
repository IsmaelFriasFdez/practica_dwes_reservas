// Normalización y validación de los datos de registro e inicio de sesión.

export function normalizarRegistro(body = {}) {
  return {
    nombre: String(body.nombre ?? "").trim(),
    email: String(body.email ?? "").trim().toLowerCase(),
    password: String(body.password ?? "")
  };
}

export function validarRegistro(valores) {
  const errores = {};
  if (valores.nombre.length < 2 || valores.nombre.length > 60) {
    errores.nombre = "El nombre debe tener entre 2 y 60 caracteres";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email)) {
    errores.email = "Introduce un correo electrónico válido";
  }
  if (valores.password.length < 8 || valores.password.length > 72) {
    errores.password = "La contraseña debe tener entre 8 y 72 caracteres";
  }
  return errores;
}

export function normalizarLogin(body = {}) {
  return {
    email: String(body.email ?? "").trim().toLowerCase(),
    password: String(body.password ?? "")
  };
}
