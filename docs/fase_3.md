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

- node js anteriormente solo funcionaba en la web, entonces node js salió para ejecutar el codigo javascript en el host de la pc y la construccion la API REST y el uso de dependencias que tambien son ejecutadas por el interprete node js.

- express es una dependencia que sirve para crear la API REST, definimos los metodos HTTP que serviran para obtener solicitudes desde el cliente y responderlos.

- typescript es un lenguaje de tipado estatico obligandome a definir los tipos para cada variable, pudiendo prevenir errores (implicitos y explicitos) antes de que el sistema vaya a produccion algo que javascript no puede al no ser de tipado.

- prisma es un orm (object relational mapping) que me permite construir los metodos crud y la creacion de la BD (en esta ocacion solamente debo de insertar (segun la version de prisma) la URL a la BD->configurar los datos clave para que se realize la conexion segun protocolo TCP a la Base de datos -> listo) sin escribir una sola linea de codigo SQL pero teniendo fundamentos de este ultimo.

- zod es para sanitizar los datos que llegan desde el cliente a la API REST validando y estandarizando el formato de los datos como la creacion del producto, su codigo, etc.

- docker es una herramienta que empaqueta mi entorno (backend/frontend) y docker compose orquesta o levanta los contenedores con la imagen de cada entorno creando una red interntre estos (en este caso mi backend se conecta con la bd mediante protocolo TCP con la url de la BD).

- postgreSQL es el motor de base de datos relacional en el que voy a almacenar la informacion estructurada en tablas relacionadas estrictamente, siempre escuchando en el puerto 5432 por defecto.