# CloudInventory - Guía de Infraestructura y Desarrollo con Docker & Prisma

Este documento recopila la arquitectura, decisiones técnicas, resolución de problemas y el flujo de trabajo implementado para el backend del proyecto **CloudInventory** (Enunciado 01).

---

## 1. Arquitectura de Infraestructura

El entorno se diseñó para separar completamente la capa de datos de la lógica de aplicación utilizando contenedores Docker independientes orquestados con **Docker Compose**:

```text
       TU MÁQUINA (Windows Host)                    RED INTERNA DOCKER
┌───────────────────────────────────────┐    ┌───────────────────────────────────┐
│ VS Code / Terminal Host               │    │ internal_network (Bridge)         │
│ - Código TypeScript (src/)            │    │                                   │
│ - pnpm prisma generate (tipado local) │    │  backend (Node.js 24 + pnpm 9)    │
│                                       │    │  - Expone :3000 hacia Windows     │
│ pgAdmin 4 / Postman                   │    │  - Se comunica a db:5432          │
│ - Conexión a localhost:5432 (Postgres)│    │     │                             │
│ - Conexión a localhost:3000 (API REST)│    │     ▼                             │
└──────────────────┬────────────────────┘    │  db (PostgreSQL 17 Alpine)        │
                   │                         │  - Puerto interno: 5432           │
                   │ Compose Watch           │  - Volumen: postgres_data         │
                   ▼                         │  - Healthcheck con pg_isready     │
         Sincronización a /app               └───────────────────────────────────┘
```

---

## 2. Conceptos Clave de Redes en Docker

* **`localhost` vs `db`**:
  * Dentro del contenedor del backend, `localhost` apunta a sí mismo (donde solo corre Express).
  * Para comunicarse con PostgreSQL, se usa el nombre del servicio: **`db`** (`db:5432`), el cual es resuelto por el DNS interno de Docker.
  * Desde Windows (Postman, pgAdmin, navegador), te conectas a **`localhost:3000`** o **`localhost:5432`** gracias a la publicación de puertos (`ports: "HOST:CONTAINER"`).
* **Nombres de bases de datos en minúsculas**:
  * PostgreSQL distingue mayúsculas y minúsculas cuando se inicializa. Para evitar errores de `FATAL: database "cloudinventory" does not exist`, el nombre estándar debe ser en minúsculas (ej. `cloud_inventory`).
* **Healthcheck & Depends_on**:
  * El servicio `db` cuenta con un `healthcheck` que ejecuta `pg_isready`.
  * `backend` tiene `depends_on: db (condition: service_healthy)`, garantizando que el backend no inicie hasta que PostgreSQL esté completamente listo para aceptar conexiones.

---

## 3. Registro de Problemas Encontrados y Soluciones

### A. Versiones inestables de Prisma (Prisma 8 RC) y rutas en Windows
* **Problema**: Al inicializar Prisma con comandos experimentales se instaló `prisma 8.0.0-rc.29` y `@prisma/orm-postgres`. Al indicar una ruta con `/` (`/prisma/contract.prisma`), Windows lo interpretó como la raíz del disco `C:\`.
* **Solución**: Se estandarizó el uso de paquetes estables (`@prisma/client` y `prisma`), eliminando contratos experimentales y rutas con barra inicial.

### B. Conflicto de versiones de Node.js en Windows (React Native vs Prisma)
* **Problema**: Node 20.18.1 producía un error con Prisma 7+ (`Prisma only supports Node.js versions 20.19+, 22.12+, 24.0+`), pero se usaba para evitar bugs en Metro/Expo con rutas absolutas en Windows.
* **Solución**:
  * Para desarrollo móvil se alterna con `nvm use 20.18.1`.
  * Para backend en Windows se alterna con `nvm use 24` (o `20.19.0` como versión híbrida).
  * Dentro del contenedor de Docker, el backend siempre corre aislado en **Node 24 (Debian Bookworm)**.

### C. Error de base de datos inexistente en el Healthcheck
* **Problema**: `FATAL: database "cloudinventory" does not exist`. Se debía a discrepancias de mayúsculas (`CloudInventory` vs `cloudinventory`) y al volumen persistente de PostgreSQL que guardó la configuración previa.
* **Solución**:
  1. Estandarizar el nombre a minúsculas: `cloud_inventory`.
  2. Destruir el volumen persistente viejo con `docker compose down -v`.
  3. Reconstruir con el nuevo nombre.

### D. Variable de puerto no definida (`puerto: undefined`)
* **Problema**: `server.ts` lanzaba error porque `process.env.PORT` no existía dentro del contenedor.
* **Solución**:
  * Como `.env` está en `.dockerignore` por seguridad, Docker Compose debe inyectarlo en tiempo de ejecución (`runtime`) mediante `env_file: - ./backend/.env`.
  * En `server.ts` se implementó un puerto fallback: `const PORT = process.env.PORT || 3000`.

### E. pnpm bloqueado en Windows (`""...tools\pnpm..."" no se reconoce`)
* **Problema**: `Corepack` o un shim viejo secuestraban el comando `pnpm` en Windows y fallaban por comillas dobles en `cmd.exe`.
* **Solución**:
  1. Desactivar Corepack: `corepack disable`.
  2. Limpiar `%LOCALAPPDATA%\pnpm`.
  3. Instalar el ejecutable nativo oficial: `irm https://get.pnpm.io/install.ps1 | iex`.

### F. Bloqueo de scripts de instalación en Docker (`ERR_PNPM_IGNORED_BUILDS`)
* **Problema**: pnpm v10 bloquea por defecto la ejecución de scripts `postinstall` de paquetes como `@prisma/engines`, `prisma` y `esbuild` en entornos no interactivos.
* **Solución**:
  * En el `Dockerfile.dev` se fijó **`pnpm@9`** (`npm install -g pnpm@9`), versión que compila dependencias nativas de forma automática sin exigir aprobaciones interactivas.

### G. Error `packages field missing or empty`
* **Problema**: Al existir un archivo `pnpm-workspace.yaml`, pnpm asumía que el backend era un monorepo y fallaba al no encontrar la clave `packages:`.
* **Solución**: Se eliminó `pnpm-workspace.yaml` ya que el backend es un servicio independiente.

### H. `The requested module '@prisma/client' does not provide an export named 'PrismaClient'`
* **Problema**: En Node ESM (`"type": "module"`), `@prisma/client` no exporta la clase hasta que se compila físicamente con `prisma generate`.
* **Solución**:
  * Ejecutar la generación del cliente dentro del contenedor:
    ```powershell
    docker compose exec backend pnpm prisma generate
    ```
  * Opcionalmente, usar el patrón universal de importación ESM:
    ```typescript
    import pkg from "@prisma/client";
    const { PrismaClient } = pkg;
    ```

---

## 4. Guía de Comandos y Flujo de Trabajo

### Levantar el entorno de desarrollo (con sincronización en vivo):
```powershell
docker compose up --build --watch
```

### Ejecutar migraciones de base de datos (hacia el contenedor Postgres):
```powershell
docker compose exec backend pnpm prisma migrate dev --name init
```

### Generar tipos en tu máquina local para autocompletado en VS Code:
```powershell
# En la carpeta backend/ de tu Windows:
pnpm prisma generate
```

### Detener los servicios:
```powershell
docker compose down
```

### Detener y reiniciar la base de datos limpia (borrando volúmenes):
```powershell
docker compose down -v
```