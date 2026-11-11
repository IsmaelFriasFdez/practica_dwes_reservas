// Datos de prueba que existen al arrancar. Las contraseñas solo se guardan como hash bcrypt.
import bcrypt from "bcrypt";

export const equiposIniciales = [
  { id: 1, codigo: "PC-001", nombre: "Ordenador aula 1", tipo: "sobremesa", estado: "operativo" },
  { id: 2, codigo: "PORT-001", nombre: "Portátil Lenovo", tipo: "portatil", estado: "operativo" },
  { id: 3, codigo: "PC-002", nombre: "Ordenador aula 2", tipo: "sobremesa", estado: "fuera_de_servicio" }
];

export const reservasIniciales = [
  { id: 1, equipoId: 1, usuarioId: 2, fecha: "2027-01-15", turno: "manana", estado: "activa" },
  { id: 2, equipoId: 2, usuarioId: 3, fecha: "2027-01-15", turno: "tarde", estado: "activa" },
  { id: 3, equipoId: 2, usuarioId: 2, fecha: "2027-02-01", turno: "manana", estado: "cancelada" }
];

export const usuariosIniciales = [
  {
    id: 1,
    nombre: "Administrador",
    email: "admin@example.com",
    passwordHash: await bcrypt.hash("Admin1234", 10),
    rol: "admin"
  },
  {
    id: 2,
    nombre: "Ana García",
    email: "ana@example.com",
    passwordHash: await bcrypt.hash("Ana12345", 10),
    rol: "usuario"
  },
  {
    id: 3,
    nombre: "Luis Pérez",
    email: "luis@example.com",
    passwordHash: await bcrypt.hash("Luis1234", 10),
    rol: "usuario"
  }
];
