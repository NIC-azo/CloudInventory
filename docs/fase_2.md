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

----------------------------------------------

- el backend sirve como comunicacion que recibe peticiones y responde a ellas sanitizando esas peticiones para que las consultas a la Base de Datos sean correctas, sirviendo como un "moso/recepcionista" de un restaurante gracias a la API (application program interface/interfaz de programa de aplicaciones) que sirve para obtener las peticiones y responde a ellas (sea respuestas correctas o de error). 

- postgresql es un motor de base de datos relacional que persiste/guarda datos para ser consultados, su funcion es para guardar los datos que son ingresados y servir estos datos que seran consultados (por un backend como norma general).

- una conexion TCP (Transmission Control Protocol) es un protocolo de comunicacion que sirve para permitir el intercambio de datos de forma segura. funciona estableciendo un acuerdo de 3 pasos (sincronizacion entre el cliente y el servidor enviando un paquete que pide abrir una conexion al servidor y le propone un numero de secuencia inicial -> el servidor responde confirmando que recibió la solicitud y envia su propio numero de secuencia -> por ultimo el cliente confirma la respuesta del servidor resultando en un canal abierto) -> al haber una conexion abierta pasamos al intercambio de datos/informacion bajo estrictas reglas (segmentacion de datos/informacion asignando un numero de secuencia -> ).