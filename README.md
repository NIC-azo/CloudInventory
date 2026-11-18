# CloudInventory - Sistema de Inventario con Infraestructura Contenedorizada

Guía completa de arquitectura, estructura de código, validación de datos con Zod, base de datos relacional con Prisma ORM y resolución de problemas técnicos para el proyecto **CloudInventory** (Enunciado 01).

---

## 1. Arquitectura General del Sistema

El sistema implementa una arquitectura desacoplada donde el servicio de backend y la base de datos relacional (PostgreSQL) corren en contenedores Docker aislados, comunicados mediante una red interna tipo *bridge*:

```text
       MÁQUINA LOCAL (Windows 11 Host)              RED INTERNA DOCKER (bridge)
┌───────────────────────────────────────────┐    ┌───────────────────────────────────┐
│ VS Code / Terminal Host                   │    │ internal_network                  │
│ - Código TypeScript (backend/src/)        │    │                                   │
│ - Tipado estático y autocompletado        │    │  cloudinventory-backend-1         │
│                                           │    │  - Node.js 24 + pnpm 9            │
│ pgAdmin 4 / DBeaver                       │    │  - Expone :3000 hacia el Host     │
│ - Conexión a localhost:5432 (Postgres)    │    │  - Se comunica a db:5432          │
│                                           │    │     │                             │
│ Cliente HTTP (Postman / Thunder Client)   │    │     ▼                             │
│ - Conexión a http://localhost:3000/api    │    │  cloudinventory-db-1              │
└─────────────────────┬─────────────────────┘    │  - PostgreSQL 17 Alpine           │
                      │                          │  - Puerto interno: 5432           │
                      │ Docker Compose Watch     │  - Volumen: postgres_data         │
                      ▼ (sincronización en vivo) │  - Healthcheck con pg_isready     │
            /app/src dentro del contenedor       └───────────────────────────────────┘
```

### Reglas Clave de Comunicación de Red:
* **`localhost` vs `db`**:
  * Dentro del contenedor `backend`, `localhost` hace referencia a sí mismo. Para conectar con la base de datos se utiliza el nombre del servicio en Compose: **`db:5432`** (resuelto por el DNS interno de Docker).
  * Desde Windows, accedes a la base de datos en **`localhost:5432`** y al backend en **`localhost:3000`** mediante la redirección de puertos (`ports: "HOST:CONTAINER"`).
* **Nombres de bases de datos en minúsculas**:
  * PostgreSQL es sensible a mayúsculas si se inicializa con comillas. El estándar adoptado es **`cloud_inventory`** en minúsculas para evitar errores `FATAL: database does not exist`.
* **Healthcheck y orden de inicio**:
  * El servicio `db` cuenta con un chequeo de disponibilidad continuo (`pg_isready`).
  * `backend` utiliza `depends_on: { db: { condition: service_healthy } }`, garantizando que Express nunca intente arrancar antes de que PostgreSQL esté 100% listo.

---

## 2. Explicación Detallada de Cada Archivo del Proyecto

### 📁 Raíz del Proyecto

* **`docker-compose.yml`**:
  Orquesta los dos servicios (`db` y `backend`).
  * Define variables de entorno, mapeo de puertos (`3000:3000` y `5432:5432`), el volumen persistente `postgres_data` y el healthcheck de PostgreSQL.
  * Configura **`develop.watch`** para sincronizar automáticamente cualquier edición en `backend/src` hacia `/app/src` en el contenedor sin requerir reconstrucción manual.
* **`.env`**:
  Almacena las credenciales principales de la infraestructura (`POSTGRES_DB=cloud_inventory`, `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=...`, `DB_PORT=5432`, `BACKEND_PORT=3000`).
* **`.gitignore`**:
  Evita versionar archivos sensibles como `.env`, carpetas pesadas como `node_modules` y archivos generados.

---

### 📁 `backend/` - Configuración e Infraestructura

* **`backend/Dockerfile.dev`**:
  Receta de construcción para el entorno de desarrollo:
  * Imagen base: `node:24-bookworm` (Linux Debian para máxima compatibilidad binaria).
  * Gestor de paquetes: `pnpm@9` (estable, sin bloqueos de scripts en entornos no interactivos).
  * Capas optimizadas: Copia primero `package.json` y `pnpm-lock.yaml`, ejecuta `pnpm install`, y finalmente copia el código.
  * Comando de arranque: Inicia con `tsx watch src/server.ts` para recarga en caliente en milisegundos.
* **`backend/.dockerignore`**:
  Impide que `node_modules` de Windows o archivos `.env` locales se copien dentro de la imagen de Docker, asegurando que las dependencias se compilen de forma nativa en Linux.
* **`backend/.env`**:
  Variables específicas del backend, principalmente `DATABASE_URL` (`postgresql://postgres:...@db:5432/cloud_inventory?schema=public`) y `PORT`.
* **`backend/package.json`**:
  Manifiesto del backend con `"type": "module"` (soporte nativo para ES Modules). Dependencias principales:
  * `express`: Servidor HTTP.
  * `@prisma/client` y `@prisma/adapter-pg`: Cliente ORM y adaptador PostgreSQL.
  * `pg`: Driver de PostgreSQL con pool de conexiones.
  * `zod`: Librería de validación y tipado en tiempo de ejecución.
  * `dotenv`: Carga de variables de entorno.
  * `tsx`: Ejecutor y vigilante de TypeScript al vuelo.
* **`backend/tsconfig.json`**:
  Configura TypeScript con modo estricto, resolución `nodenext` y alias de importación limpios (`@/*`, `@controllers/*`, `@models/*`, etc.).

---

### 📁 `backend/prisma/` - Capa de Base de Datos (ORM)

* **`backend/prisma/schema.prisma`**:
  Define el modelo de datos relacional para la tabla `Products`:
  * `id`: Identificador único UUID (`@default(uuid())`).
  * `SKU`: Código único de inventario (`@unique`).
  * `nombre`, `descripcion`: Textos comerciales.
  * `precio`: Valor numérico de alta precisión (`Decimal @db.Decimal(10, 2)`).
  * `stock`: Cantidad entera disponible (`Int @default(5)`).
  * `activo`: Flag de baja lógica (`Boolean @default(true)`).
  * `fecha_creacion`: Marca de tiempo automática (`DateTime @default(now())`).
  * `fecha_actualizacion`: Se actualiza automáticamente al modificar (`@updatedAt`).

---

### 📁 `backend/src/` - Código Fuente de la Aplicación

#### `src/server.ts`
Punto de entrada principal del servicio. Inicializa la aplicación Express, activa los analizadores de JSON y formularios (`express.json()`), define el endpoint raíz `/health` (RF-06), monta el router modular `/api` y establece un middleware global para atrapar cualquier error no controlado sin detener el servidor.

#### `src/schemas/products.schema.ts`
Contiene los esquemas de validación construidos con **Zod**:
* **`createProductSchema`**: Exige SKU válido (3-30 caracteres), nombre (min 2 caracteres), descripción no vacía, precio positivo (`.positive()`) y stock entero no negativo (`.int().nonnegative()`), cumpliendo con los requerimientos **RF-01** y **RF-05**.
* **`updateProductSchema`**: Mismas reglas pero con campos opcionales, agregando una regla `.refine()` que rechaza peticiones vacías `{}`.
* **`productIdParamSchema`**: Valida que el parámetro de ruta `:id_product` tenga un formato estricto de UUID.
* **Inferencia de tipos**: Exporta tipos `CreateProductInput` y `UpdateProductInput` mediante `z.infer`, garantizando coherencia absoluta entre validación y TypeScript.

#### `src/middlewares/validate.middleware.ts`
Middlewares interceptores reutilizables:
* **`validateBody(schema)`**: Evalúa `req.body` con `schema.safeParse()`. Si hay errores, detiene la petición y devuelve un HTTP 400 estructurado con el campo exacto y el mensaje. Si es válido, inyecta los datos saneados en `req.body` y pasa al siguiente paso con `next()`.
* **`validateParams(schema)`**: Hace lo mismo para los parámetros de la URL (`req.params`), como validar el UUID de un producto antes de consultar la base de datos.

#### `src/middlewares/error.middleware.ts`
Contiene la función envolvente de orden superior (decorador) **`errorHandler`**:
* Envuelve cualquier método asíncrono del controlador (`async (req, res) => ...`).
* Atrapa automáticamente cualquier promesa rechazada o excepción de base de datos y la redirige al manejador de errores de Express con `next(err)`.

#### `src/controllers/products.controller.ts`
Controlador HTTP desacoplado. Como los middlewares de Zod ya validaron los tipos y rangos numéricos antes de entrar aquí, el controlador solo gestiona la lógica del flujo:
* `healthCheck`: Responde el estado del servicio.
* `getAllProducts`: Llama al modelo para traer productos activos.
* `getProductById`: Valida existencia y devuelve el producto.
* `createProduct`: Valida la unicidad del SKU (regla de negocio) y guarda el nuevo producto.
* `updateProduct`: Verifica que el producto exista, revisa que el nuevo SKU no choque con otro registro y actualiza.
* `deleteProduct`: Ejecuta la desactivación lógica del producto.

#### `src/models/products.models.ts`
Capa de abstracción de datos. Contiene los métodos que interactúan directamente con Prisma Client (`findMany`, `findUnique`, `create`, `update`). Centraliza las consultas SQL y el filtro de baja lógica (`where: { activo: true }`).

#### `src/routes/products.route.ts` y `src/routes/index.routes.ts`
Define las rutas REST conectando cada endpoint con sus middlewares de validación Zod y su método en el controlador:
* `GET    /api/products/health` ➔ Comprobación de salud.
* `GET    /api/products/` ➔ Obtener todos los productos activos.
* `GET    /api/products/:id_product` ➔ `validateParams` ➔ Obtener por ID.
* `POST   /api/products/create` ➔ `validateBody` ➔ Crear producto.
* `PUT    /api/products/update/:id_product` ➔ `validateParams` + `validateBody` ➔ Actualizar producto.
* `DELETE /api/products/delete/:id_product` ➔ `validateParams` ➔ Desactivar producto.

#### `src/libs/prisma.singleton.ts`
Implementa el patrón de diseño **Singleton** para Prisma Client:
* Evita agotar el pool de conexiones de PostgreSQL durante la recarga en caliente de desarrollo (`tsx watch`).
* Configura el adaptador `@prisma/adapter-pg` y desactiva SSL en entornos locales (`ssl: isProduction ? ... : false`) para evitar fallos de apretón de manos TLS contra el contenedor Docker.

#### `src/utils/api_response.util.ts`
Estandariza el formato de todas las respuestas JSON de la API:
* `returnResults(res, data, status)` ➔ Devuelve `{ data: ... }`.
* `operations(res, message, status)` ➔ Devuelve `{ message: ... }`.
* `errorOperation(res, error, status)` ➔ Devuelve `{ message: ... }` o `{ mensaje, errores: [...] }` para errores de validación.

---

## 3. Cobertura de Requerimientos del Proyecto

| Requerimiento | Descripción | Implementación en el Código |
| :--- | :--- | :--- |
| **RF-01** | Registro de productos (SKU, nombre, precio, stock, etc.) | `POST /api/products/create` con `createProductSchema` |
| **RF-02** | Consulta general y por ID individual | `GET /api/products/` y `GET /api/products/:id_product` |
| **RF-03** | Actualización de información | `PUT /api/products/update/:id_product` con `updateProductSchema` |
| **RF-04** | Desactivación (baja lógica sin eliminar físico) | `DELETE /api/products/delete/:id_product` asigna `activo: false` |
| **RF-05** | Validación de datos (precios > 0, stock >= 0, SKU único) | Reglas Zod `.positive()`, `.nonnegative()` y chequeo en controller |
| **RF-06** | Comprobación de salud del servicio | `GET /health` y `GET /api/products/health` |

---

## 4. Registro de Problemas Técnicos y Soluciones (Troubleshooting)

### A. Versiones inestables de Prisma (Prisma 8 RC) y rutas en Windows
* **Síntoma**: Fallo interno `Cannot use 'in' operator to search for 'kind' in typeChoice` y rutas dispersas como `../../../../prisma/contract.prisma`.
* **Causa**: Se instaló una versión preliminar inestable (`8.0.0-rc.29`) y escribir `/prisma/...` con barra inicial fue interpretado en Windows como la raíz del disco `C:\`.
* **Solución**: Se estandarizó la instalación con `@prisma/client` y `prisma` estables, utilizando rutas relativas limpias.

### B. Conflicto de versiones de Node.js en Windows (React Native vs Prisma)
* **Síntoma**: Prisma 7+ requiere Node `>=20.19`, pero el sistema tenía `20.18.1` por compatibilidad con Metro/Expo en Windows.
* **Solución**: Uso de `nvm use 24` para backend (o `20.19.0` como versión universal). En Docker, el contenedor siempre corre aislado en **Node 24 Bookworm**.

### C. Error de base de datos inexistente en el Healthcheck
* **Síntoma**: `FATAL: database "cloudinventory" does not exist`.
* **Causa**: PostgreSQL fue inicializado como `CloudInventory` (con mayúsculas) y los clientes buscaban en minúsculas. Además, el volumen persistente Docker conservaba la base de datos vieja.
* **Solución**: Renombrar a minúsculas (`cloud_inventory`), destruir el volumen viejo con `docker compose down -v` y recrear limpio.

### D. Variable de puerto no definida (`puerto: undefined`)
* **Síntoma**: `server.ts` se detenía porque `process.env.PORT` no existía.
* **Causa**: El archivo `.env` está ignorado en `.dockerignore` por seguridad; Docker Compose no estaba inyectando el archivo al contenedor.
* **Solución**: Agregar `env_file: - ./backend/.env` en `docker-compose.yml` y colocar un puerto fallback en `server.ts`.

### E. pnpm bloqueado en Windows (`""...tools\pnpm..."" no se reconoce`)
* **Síntoma**: El comando `pnpm` fallaba con errores de comillas en `cmd.exe`.
* **Causa**: Corepack dejó shims rotos tras cambiar de versión de Node.
* **Solución**: Ejecutar `corepack disable`, limpiar `%LOCALAPPDATA%\pnpm` e instalar el binario nativo oficial `pnpm.exe` con `irm https://get.pnpm.io/install.ps1 | iex`.

### F. Bloqueo de scripts de instalación en Docker (`ERR_PNPM_IGNORED_BUILDS`)
* **Síntoma**: `pnpm install` fallaba en Docker al ignorar la compilación de `@prisma/engines` y `esbuild`.
* **Causa**: pnpm v10 bloquea por seguridad los scripts `postinstall` en entornos no interactivos.
* **Solución**: Fijar `pnpm@9` en `Dockerfile.dev` (`npm install -g pnpm@9`), versión que compila dependencias nativas automáticamente sin requerir confirmación por teclado.

### G. Error `packages field missing or empty`
* **Síntoma**: `pnpm` en Docker crasheaba al arrancar cualquier comando.
* **Causa**: La existencia de un archivo `pnpm-workspace.yaml` hacía que pnpm tratara el backend como un monorepo incompleto.
* **Solución**: Eliminar `pnpm-workspace.yaml`, ya que el backend es un servicio independiente.

### H. Error TLS en conexión a PostgreSQL (`Error opening a TLS connection`)
* **Síntoma**: `DriverAdapterError: TlsConnectionError` al ejecutar consultas de Prisma.
* **Causa**: En `prisma.singleton.ts` la configuración del pool forzaba SSL (`rejectUnauthorized: false`) contra el contenedor Docker, el cual corre PostgreSQL sin cifrado TLS.
* **Solución**: Condicionar SSL únicamente para entornos de producción: `ssl: isProduction ? { rejectUnauthorized: false } : false`.

---

## 5. Guía Rápida de Comandos

### Iniciar todo el entorno con sincronización en caliente:
```powershell
docker compose up --build --watch
```

### Ejecutar migraciones o sincronizar esquema con PostgreSQL:
```powershell
docker compose exec backend pnpm prisma db push
# O para crear una migración formal:
docker compose exec backend pnpm prisma migrate dev --name init
```

### Generar el cliente Prisma local (para autocompletado en VS Code):
```powershell
cd backend
pnpm prisma generate
```

### Detener los servicios:
```powershell
docker compose down
```

### Reiniciar la base de datos desde cero (destruyendo volúmenes):
```powershell
docker compose down -v
```
