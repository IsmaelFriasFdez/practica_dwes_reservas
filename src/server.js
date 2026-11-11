// Punto de entrada
// Se arranca con: node --env-file=.env src/server.js  (npm start)
import { config } from "./config.js";
import { app } from "./app.js";

app.listen(config.puerto, () => {
  console.log(`Servidor en http://localhost:${config.puerto}`);
});
