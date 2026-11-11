import { defineConfig } from "vitest/config";

// Variables de entorno controladas para las pruebas
export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      SESSION_SECRET: "secreto-de-pruebas-con-mas-de-32-caracteres"
    }
  }
});
