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