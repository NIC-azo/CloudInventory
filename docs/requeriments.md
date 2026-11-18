ENUNCIADO 01 · NIVEL INICIAL

# CloudInventory

Despliegue de un servicio de inventario con infraestructura local contenedorizada

[Solis OS POS — Smart POS for Shops, Cafes & Salons | 10-Day Free Trial](https://images.openai.com/static-rsc-4/XKEQQRy9PPhHxcceg5OZaCKBYn7ned2gCFqEDH6oWig7n2uEhm1JbqClezZaFF1Bi0L7vqsu55VS-sSHwNy96VmfbScOMz6m2_KB5CuLaAhS7O-VhO6T6PADSVyn3qdxQrVLs0c6fKWCg0x8Y3zR-zpzmXhHEWBljepcdcpj8yU?purpose=inline)

[solis-os.com](https://solis-os.com/pos.html?utm_source=chatgpt.com)

Tipo de proyecto: Integrador de infraestructura y desarrollo backend.

Entorno: Windows 11 + VS Code + Docker Desktop.

Arquitectura: API REST + base de datos relacional.

Modalidad: Individual, con posibilidad de ampliación web y móvil.

## 1. Objetivo de la práctica

Una empresa distribuidora necesita implementar un sistema básico de inventario que permita registrar, consultar y actualizar productos almacenados en su almacén principal.

Actualmente, los datos se administran de forma manual, lo que dificulta mantener actualizada la información y ocasiona inconsistencias cuando se modifican productos o cantidades disponibles.

La empresa solicita construir un servicio backend que gestione los productos y almacene la información en una base de datos relacional independiente.

La infraestructura debe ejecutarse mediante Docker, de manera que el backend y PostgreSQL funcionen como servicios independientes y puedan comunicarse mediante una red interna.

El sistema debe poder detenerse, iniciarse nuevamente y conservar su información.

## 2. Requerimientos funcionales

El servicio deberá permitir:

RF-01. Registro de productos

Registrar nuevos productos con los siguientes campos:

| Campo                  | Descripción                       |
| ---------------------- | --------------------------------- |
| ID                     | Identificador único               |
| SKU                    | Código único del producto         |
| Nombre                 | Nombre comercial                  |
| Descripción            | Información adicional, opcional   |
| Precio                 | Valor monetario                   |
| Stock                  | Unidades disponibles              |
| Activo                 | Indica si se encuentra disponible |
| Fecha de creación      | Momento del registro              |
| Fecha de actualización | Última modificación               |

RF-02. Consulta de productos

Permitir obtener todos los productos registrados y consultar un producto individual por su identificador.

RF-03. Actualización

Permitir modificar el nombre, descripción, precio y cantidad disponible.

RF-04. Desactivación

Permitir desactivar un producto sin tener que eliminar físicamente su registro de la base de datos.

RF-05. Validación de información

El backend debe rechazar datos inválidos, como precios negativos, cantidades negativas o códigos SKU duplicados.

RF-06. Estado del servicio

Debe existir un endpoint que permita comprobar si la aplicación está funcionando.

Ejemplo conceptual:

```
GET /health
```

La respuesta debe permitir identificar que el backend está activo.

## 3. Requerimientos de infraestructura

La empresa establece las siguientes condiciones:

1. La aplicación backend debe ejecutarse en un contenedor Docker.
2. PostgreSQL debe ejecutarse en un contenedor independiente.
3. Los servicios deben comunicarse mediante una red interna de Docker.
4. La información de PostgreSQL debe conservarse mediante un volumen persistente.
5. El backend debe recibir los parámetros de conexión mediante variables de entorno.
6. El proyecto debe poder iniciarse utilizando Docker Compose.
7. La base de datos debe tener un mecanismo de comprobación de disponibilidad (`healthcheck`).
8. Los cambios realizados al código backend deben poder reflejarse durante el desarrollo sin reconstruir manualmente todo el entorno en cada modificación.
9. Las credenciales no deben quedar expuestas en GitHub.

-----------------------------------------------

4. Fases de desarrollo
Fase 1. Interpretación y análisis del requerimiento

Antes de programar, debes identificar:
- Qué problema resuelve el sistema.
- Qué datos necesita almacenar.
- Qué operaciones ejecutará.
- Qué componentes necesitan comunicarse.
- Qué ocurre cuando PostgreSQL no está disponible.
Entregable: descripción de requisitos, modelo de datos inicial y diagrama de comunicación.

Fase 2. Diseño de arquitectura y comunicación

Determina qué componentes necesita el proyecto y cómo se comunicarán.

Investiga:
- Qué función tiene el backend.
- Qué función tiene PostgreSQL.
- Cómo funciona una conexión TCP hacia un puerto.
- Qué significa localhost.
- Cómo funciona el DNS interno de Docker Compose.
- Qué diferencia hay entre una red interna y un puerto publicado.
Entregable: diagrama de arquitectura, puertos, protocolos y variables de configuración necesarias.

Fase 3. Selección de tecnologías y dependencias

Investiga las dependencias que necesitas para construir los componentes.

Debes justificar la selección de:
- Node.js.
- Express.
- TypeScript.
- Prisma y su configuración de conexión PostgreSQL.
- Zod para validación de datos.
- Docker y Docker Compose.
- PostgreSQL.
Entregable: listado de dependencias con su propósito y los archivos de configuración que requieren.

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

Fase 5. Implementación del backend

Construye las responsabilidades necesarias para:
- Inicializar Express.
- Validar las variables de entorno.
- Configurar una instancia reutilizable de Prisma.
- Definir el modelo de productos.
- Gestionar las consultas a PostgreSQL.
- Implementar las reglas de negocio.
- Procesar las solicitudes HTTP.
- Gestionar los errores.
No se solicita que todos los procesos estén en un único archivo.

Entregable: API REST funcional con operaciones CRUD.

Fase 6. Verificación y pruebas

Ejecuta solicitudes desde Postman, curl o una herramienta equivalente.

Comprueba:
- Registro de productos.
- Consulta individual y general.
- Actualización.
- Desactivación.
- Rechazo de datos inválidos.
- Rechazo de SKU duplicado.
- Conservación de los datos tras reiniciar PostgreSQL.
- Comportamiento cuando la base de datos deja de estar disponible.
Entregable: evidencias de las pruebas y explicación de los resultados.

Fase 7. Relación con AWS

Investiga cómo podrías trasladar la arquitectura local a AWS.

Compara el entorno local con EC2, RDS, EBS y VPC.

Explica qué responsabilidades seguirían correspondiendo al desarrollador y cuáles pasarían a ser administradas por AWS.

Entregable: tabla comparativa y diagrama conceptual de la arquitectura cloud.