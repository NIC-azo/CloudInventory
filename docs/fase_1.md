Fase 1. Interpretación y análisis del requerimiento

Antes de programar, debes identificar:
- Qué datos necesita almacenar.
- Qué operaciones ejecutará.
- Qué componentes necesitan comunicarse.
- Qué ocurre cuando PostgreSQL no está disponible.
Entregable: descripción de requisitos, modelo de datos inicial y diagrama de comunicación.

- se necesitan almacenar (si nos vamos por tipos de datos): 
    * strings o cadenas de caracteres
    * decimales o float's (para mantener precisión en los precios de cada producto)
    * enteros o int (para la cantidad de stock o cantidad que existe de un producto)
    * booleanos o boolean's (para especificar si un producto se encuentra activo)
    * datetime para la fecha y hora en la que se crea/actualiza un producto (servible para auditoria y orden)

    - si nos vasamos en datos para el negocio:

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

- segun requerimientos son operaciones CRUD, sin obviar que el backend tendra operaciones de validacion de estado y sanitizacion de los datos

- el componente/contenedor de la bd al ser el punto de partida de persistencia y operaciones CRUD de los datos luego el componente/contenedor backend que es donde vive la api/servidor que se COMUNICA con la bd, por ultimo seria la CLI aunque no la contaria por servir como cliente pero si cuenta al comunicarse con el backend para que el backend oiga->valide->verifique que la informacion a sido consultada/ingresada correctamente.

- el contenedor tiene una condicion `condition`: service_healthy gracias al key `depends-on` que marca "si la bd no pasa el test, entonces el backend no arrancará/funcionar" y asi mismo los demas servicios.

