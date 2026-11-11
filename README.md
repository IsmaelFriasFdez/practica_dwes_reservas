# Práctica DWES (UD2 y UD3): Sistema de reserva de equipos informáticos

Aplicación web con Node.js, Express, EJS y JavaScript, con una parte en TypeScript, para
gestionar la reserva de equipos informáticos de un centro educativo.

**Historial de uso de IA:** _[enlace a la conversación]_

## Instalación, configuración y ejecución

```bash
npm install
cp .env.example .env        # en Windows: copy .env.example .env
```

Edita `.env` y rellena `SESSION_SECRET` con un valor de al menos 32 caracteres. Puedes generarlo con:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

| Variable         | Valores admitidos                    |
|------------------|--------------------------------------|
| `PORT`           | entero entre 1 y 65535 (por defecto 3000) |
| `NODE_ENV`       | `development`, `test` o `production` |
| `SESSION_SECRET` | 32 caracteres o más                  |

`src/config.js` valida estos valores al arrancar y, si alguno es incorrecto, la aplicación no se inicia.

```bash
npm start          # node --env-file=.env src/server.js
```

Abre <http://localhost:3000/equipos>.

**Usuarios de prueba:**

| Rol     | Correo              | Contraseña  |
|---------|---------------------|-------------|
| admin   | `admin@example.com` | `Admin1234` |
| usuario | `ana@example.com`   | `Ana12345`  |
| usuario | `luis@example.com`  | `Luis1234`  |

## Implementación

**Organización por capas** (`src/`):
- **Rutas** (`routes/`): método HTTP, URL y middleware.
- **Controladores** (`controllers/`): reciben, validan y convierten los datos y deciden la respuesta HTTP.
- **Servicios** (`services/`): reglas de negocio, sin `req`, `res` ni EJS.
- **Repositorios** (`repositories/`): acceso a las colecciones en memoria.
- **Vistas** (`views/`): presentación con EJS.

`app.js` crea la aplicación y conecta las capas; `server.js` solo la pone a escuchar.

**Datos:** al arrancar hay 3 equipos, 3 reservas y 3 usuarios (`src/datos/iniciales.js`). Las
contraseñas se guardan con bcrypt.

**Errores de dominio:** los servicios lanzan `ErrorDominio(codigo, mensaje)`
(`src/domain/Errores.js`). `src/http/tratarError.js` es el tratamiento centralizado: traduce cada
código a 400, 403, 404 o 409 y responde 500 a los fallos inesperados, sin mostrar trazas.

### Consulta de equipos
- `GET /equipos` filtra por `tipo` y `operativos=true` (`src/utilidades/equipos.js`).
- `GET /equipos/:id` muestra la ficha con su información y estado: 400 si el id no es válido y 404 si no existe.
- Cookie de preferencias `tipoPreferido`: guarda el tipo elegido y se usa como filtro inicial del catálogo.

### Registro y autenticación
- **`POST /registro`:** valida los datos y que el correo no esté repetido (400 si falla). Guarda
  la contraseña con bcrypt y asigna siempre el rol `usuario`.
- **`POST /login`:** comprueba las credenciales con `bcrypt.compare` y devuelve el mismo
  mensaje (401) tanto si el correo no existe como si la contraseña es incorrecta. Regenera la
  sesión y guarda solo `usuarioId`.
- **`POST /logout`:** destruye la sesión y retira la cookie.
- **`GET /perfil`:** solo para usuarios autenticados.

### Creación de reservas
- `GET /reservas/nueva` muestra el formulario en dos pasos: primero se eligen la fecha y el turno,
  y después solo aparecen los equipos disponibles (`obtenerEquiposDisponibles`). El modelo de
  vista es `src/presentation/formularioReservaVM.js`.
- `POST /reservas` toma el usuario de la sesión y repite todas las comprobaciones:
  - en el controlador, con `validarReserva`: datos válidos y fecha no anterior a hoy (400);
  - en el servicio: que el equipo exista (404) y esté operativo (409), y que no haya otra reserva
    activa para el mismo equipo, fecha y turno (`estaReservado`, 409).
- Si todo va bien, se aplica PRG (303) y se muestra un mensaje de confirmación de un solo uso.
  Si hay error, se vuelve a mostrar el formulario con los campos válidos y los errores.

### Consulta y cancelación de reservas
- `GET /mis-reservas` lista las reservas activas y las canceladas del usuario.
- `POST /reservas/:id/cancelar` solo permite cancelar reservas propias, activas y con fecha no
  pasada. El servicio comprueba la propiedad, así que cambiar el id de la URL da 403. La
  cancelación cambia el estado de la reserva; no la elimina.

### Administración
Las rutas de `/admin` usan `exigirRol("admin")`: un usuario ordinario recibe 403. El
administrador puede añadir equipos, cambiar su estado, consultar todas las reservas y cancelar
cualquier reserva activa.

### Cookies y sesiones
- `express-session` se configura con `httpOnly`, `secure` (en producción), `sameSite: "lax"` y `maxAge`.
- La sesión guarda la identidad (`usuarioId`), el token CSRF y el mensaje de confirmación tras
  una redirección.
- Los permisos se deciden con el usuario obtenido del servidor, nunca con la cookie de preferencias.

### Seguridad
- **Middleware reutilizable:** `exigirAutenticacion` y `exigirRol` (`src/middleware/autenticacion.js`).
- **CSRF:** token por sesión, comprobado en todos los formularios autenticados que modifican el
  estado, incluido el logout (`src/middleware/csrf.js`).
- **Límite de intentos:** `express-rate-limit` en `POST /login`.
- **Escape de datos:** todos los datos de usuario se muestran con `<%= %>`.

### JavaScript
Las funciones `obtenerEquiposDisponibles`, `estaReservado` y `validarReserva` están en
`src/utilidades/reservas.js`. A lo largo del código se usan `find`, `filter`, `map` y `some`.

### TypeScript (`src-ts/`)
- `modelos.ts`: interfaces `Equipo`, `Reserva` y `Usuario`, y tipos unión para roles, turnos y estados.
- `RepositorioReservas.ts`: interfaz del repositorio.
- `RepositorioReservasMemoria.ts`: clase que implementa la interfaz con `Map`.
- `ServicioReservas.ts`: recibe el repositorio por el constructor (inyección de dependencias).
- `ErrorDominio.ts`: errores de dominio.

Compila con `strict: true`, sin errores y sin `any`:

```bash
npm run build
```

## Pruebas

```bash
npm test
```

Las 10 pruebas usan Vitest y Supertest sobre `crearApp()`, sin arrancar el servidor y con datos de
prueba controlados (`vitest.config.js` define el entorno de prueba).

| # | Comportamiento | Archivo |
|---|---|---|
| 1 | Registro de un usuario válido | `tests/auth.test.js` |
| 2 | Rechazo de credenciales incorrectas | `tests/auth.test.js` |
| 3 | Ruta privada sin autenticación | `tests/auth.test.js` |
| 4 | Ruta privada con sesión | `tests/auth.test.js` |
| 5 | Operación de admin hecha por un usuario ordinario | `tests/admin.test.js` |
| 6 | Reserva válida | `tests/reservas.test.js` |
| 7 | Reserva duplicada | `tests/reservas.test.js` |
| 8 | Cancelación de una reserva ajena | `tests/reservas.test.js` |
| 9 | Cambio de estado sin token CSRF | `tests/admin.test.js` |
| 10 | Sesión invalidada tras el logout | `tests/auth.test.js` |

## Ejemplos con curl

Los ejemplos usan bash (en Windows, Git Bash).
- `-c` y `-b` guardan y envían las cookies en `cookies.txt`, y así se mantiene la sesión.
- El token CSRF se obtiene del campo oculto `_csrf` de una página de la sesión.
- Todas estas operaciones se pueden hacer también desde la interfaz HTML.

```bash
B=http://localhost:3000
J=cookies.txt
csrf() { curl -s -b $J -c $J "$B$1" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//'; }
```

### Consulta de equipos
```bash
curl -i "$B/equipos"
curl -s "$B/equipos?tipo=portatil"
curl -s "$B/equipos?tipo=sobremesa"
curl -s "$B/equipos?operativos=true"
curl -s "$B/equipos?tipo=portatil&operativos=true"
curl -s "$B/equipos/1"
curl -s -c $J "$B/equipos?tipo=portatil" > /dev/null    # guarda la cookie de preferencias
curl -s -b $J "$B/equipos"                             # filtro inicial: portátiles
```

### Registro, login, perfil y logout
```bash
rm -f $J
curl -i -b $J -c $J -X POST "$B/registro" -d "nombre=Marta López" -d "email=marta@example.com" -d "password=Marta1234"   # 303
curl -i -b $J -c $J -X POST "$B/login" -d "email=marta@example.com" -d "password=mal"         # 401
curl -i -b $J -c $J -X POST "$B/login" -d "email=marta@example.com" -d "password=Marta1234"   # 303
curl -s -b $J -c $J "$B/perfil"                                                               # 200
T=$(csrf /perfil)
curl -i -b $J -c $J -X POST "$B/logout" -d "_csrf=$T"     # 303
curl -i -b $J -c $J "$B/perfil"                           # 303 → /login
```

### Reservas
```bash
rm -f $J
curl -s -b $J -c $J -X POST "$B/login" -d "email=luis@example.com" -d "password=Luis1234" > /dev/null
curl -s -b $J -c $J "$B/reservas/nueva?fecha=2027-03-01&turno=manana"    # equipos disponibles
T=$(csrf /mis-reservas)
curl -i -b $J -c $J -X POST "$B/reservas" -d "_csrf=$T" -d equipoId=2 -d fecha=2027-03-01 -d turno=manana   # 303
curl -i -b $J -c $J -X POST "$B/reservas" -d "_csrf=$T" -d equipoId=2 -d fecha=2027-03-01 -d turno=manana   # 409
curl -s -b $J -c $J "$B/mis-reservas"
curl -i -b $J -c $J -X POST "$B/reservas/1/cancelar" -d "_csrf=$T"     # 403: reserva de otro usuario
curl -i -b $J -c $J -X POST "$B/reservas/2/cancelar" -d "_csrf=$T"     # 303
```

### Administración
```bash
rm -f $J
curl -s -b $J -c $J -X POST "$B/login" -d "email=admin@example.com" -d "password=Admin1234" > /dev/null
T=$(csrf /admin/equipos)
curl -s -b $J -c $J "$B/admin/equipos"
curl -i -b $J -c $J -X POST "$B/admin/equipos" -d "_csrf=$T" -d codigo=PORT-002 -d "nombre=Portátil HP" -d tipo=portatil -d estado=operativo   # 303
curl -i -b $J -c $J -X POST "$B/admin/equipos/3/estado" -d "_csrf=$T" -d estado=operativo   # 303
curl -i -b $J -c $J -X POST "$B/admin/equipos/3/estado" -d estado=fuera_de_servicio         # 403 sin CSRF
curl -s -b $J -c $J "$B/admin/reservas"
curl -i -b $J -c $J -X POST "$B/admin/reservas/1/cancelar" -d "_csrf=$T"                     # 303
```
