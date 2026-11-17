Fase 4. Preparación del entorno

Configura el entorno para que el proyecto pueda ejecutarse de manera reproducible.

Debes preparar:

- Estructura inicial de carpetas.
- package.json y archivo de bloqueo de dependencias.
- tsconfig.json.
- .env y .env.example.
- .gitignore.
- Dockerfile.
- .dockerignore.
- compose.yaml.
  Utiliza Docker Compose para ejecutar PostgreSQL y backend como servicios independientes.

Entregable: entorno Docker funcional, con persistencia y comunicación interna.

- [primero se realizó esta estructura

backend -
|
|_src/controllers/,src/libs,src/middlewares,src/models,src/routes,src/types,src/utils/
|_.env
|\_.env.example
|\_package.json
|\_Dockerfile.dev
|\_.dockerignore

docs/

docker-compose.yml
.gitignore
.env
.env.example
.dockerignore
]

por ultimo ejecuté el script tsc --init

y por ultimo el prisma:init

resultando: ├───backend
│ ├───prisma
│ └───src
│ ├───controllers
│ ├───libs
│ ├───middlewares
│ ├───models
│ ├───routes
│ ├───types
│ └───utils
└───docs
