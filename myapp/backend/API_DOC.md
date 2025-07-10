# API - Documentación de Endpoints

## Autenticación

### `POST /login`

Autentica a un usuario y devuelve un token JWT.

- **Body:** `{ "email": str, "password": str }`
- **Response:** `{ "access_token": str, "role": str, "name": str }`

### `GET /test`

Endpoint de prueba para verificar que el backend responde.

---

## Asignaturas

### `GET /subjects`

Lista las asignaturas del usuario autenticado (según su rol).

- **Auth:** JWT requerido

### `GET /subjects/<code>`

Devuelve la información de una asignatura por su código.

### `GET /subjects/<code>/resources`

Lista los recursos de una asignatura. Para profesores, incluye información de entregas.

- **Auth:** JWT requerido

### `POST /subjects/<code>/resources`

Permite a un profesor crear un nuevo recurso en una asignatura.

- **Auth:** JWT requerido (rol: profesor)
- **Body:** `{ "title": str, "type": str, "description": str, "due_date": str }`

---

## Recursos

### `GET /resources/<rid>`

Devuelve la información completa de un recurso por su ID.

- **Auth:** JWT requerido

### `PUT /resources/<rid>`

Permite a un profesor actualizar los campos de un recurso.

- **Auth:** JWT requerido (rol: profesor)
- **Body:** `{ "title": str, "type": str, "description": str, "due_date": str }`

### `DELETE /resources/<rid>`

Permite a un profesor eliminar un recurso.

- **Auth:** JWT requerido (rol: profesor)

---

## Entregas (Submissions)

### `POST /resources/<rid>/submit`

Permite a un estudiante subir un archivo como entrega para un recurso (ejercicio).

- **Auth:** JWT requerido (rol: estudiante)
- **FormData:** `file`

### `GET /resources/<rid>/submissions`

Permite a un profesor listar todas las entregas de un recurso.

- **Auth:** JWT requerido (rol: profesor)

### `GET /resources/<rid>/submission`

Devuelve la entrega del recurso correspondiente al alumno autenticado.

- **Auth:** JWT requerido (rol: estudiante)

### `PATCH /submissions/<sid>`

Permite a un profesor calificar una entrega (submission) por su ID.

- **Auth:** JWT requerido (rol: profesor)
- **Body:** `{ "grade": valor }`

### `DELETE /submissions/<sid>`

Permite borrar una entrega. El profesor puede borrar cualquiera; el alumno solo la suya.

- **Auth:** JWT requerido

---

> Para todos los endpoints que requieren autenticación, debes enviar el JWT en el header:
> `Authorization: Bearer <token>`
