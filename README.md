# API de gestion de tareas

API REST para administrar tareas y categorias con Express y MongoDB.

## Requisitos

- Node.js y npm
- MongoDB en ejecucion

## Instalacion y ejecucion

```bash
npm install
npm run dev
```

La API se inicia por defecto en `http://localhost:5000`. Para ejecutar sin
recarga automatica, usa `npm start`.

Puedes configurar el puerto y la conexion a MongoDB mediante variables de
entorno en un archivo `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/gestion_tareas
```

El archivo `.env` no se sube al repositorio.

## Endpoints

Todas las rutas aceptan y devuelven JSON.

### Categorias

Base: `/api/categorias`

| Metodo | Ruta | Accion |
| --- | --- | --- |
| `GET` | `/api/categorias` | Listar categorias |
| `GET` | `/api/categorias/:id` | Obtener una categoria |
| `POST` | `/api/categorias` | Crear una categoria |
| `PUT` | `/api/categorias/:id` | Actualizar una categoria |

Una categoria requiere `nombre` (2-60 caracteres) y `descripcion` (hasta 300):

```json
{
  "nombre": "Trabajo",
  "descripcion": "Tareas relacionadas con el trabajo"
}
```

### Tareas

Base: `/api/tareas`

| Metodo | Ruta | Accion |
| --- | --- | --- |
| `GET` | `/api/tareas` | Listar tareas |
| `GET` | `/api/tareas/incompletas` | Listar tareas incompletas |
| `GET` | `/api/tareas/completas` | Listar tareas completadas |
| `GET` | `/api/tareas/categoria/:categoriaId` | Listar tareas por categoria |
| `GET` | `/api/tareas/:id` | Obtener una tarea |
| `POST` | `/api/tareas` | Crear una tarea |
| `PUT` | `/api/tareas/:id` | Actualizar una tarea |
| `PATCH` | `/api/tareas/:id/completar` | Marcar una tarea como completada |
| `DELETE` | `/api/tareas/:id` | Eliminar una tarea |

Para crear una tarea, envia un `titulo` (3-120 caracteres), una `descripcion`
(hasta 1000) y el ID de una categoria existente:

```json
{
  "titulo": "Preparar informe",
  "descripcion": "Reunir los datos del mes",
  "categoria": "ID_DE_CATEGORIA"
}
```

Ejemplo para crear una categoria:

```bash
curl -X POST http://localhost:5000/api/categorias \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Trabajo\",\"descripcion\":\"Tareas del trabajo\"}"
```
