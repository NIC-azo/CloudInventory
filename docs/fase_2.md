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

- una conexion TCP (Transmission Control Protocol) es un protocolo de comunicacion que sirve para permitir el intercambio de datos de forma segura. funciona estableciendo un acuerdo de 3 pasos (sincronizacion entre el cliente y el servidor enviando un paquete que pide abrir una conexion al servidor y le propone un numero de secuencia inicial -> el servidor responde confirmando que recibió la solicitud y envia su propio numero de secuencia -> por ultimo el cliente confirma la respuesta del servidor resultando en un canal abierto) -> al haber una conexion abierta pasamos al intercambio de datos/informacion bajo estrictas reglas (segmentacion de datos/informacion asignando un numero de secuencia -> el receptor al recibir un grupo de esos segmentos, devuelve un mensaje ack indicando lo que recibio y cual es el siguiente numero que espera (si el emisor no recibe el mensaje ack en un tiempo determinado entonces asume que se perdió el ack y vuelve a enviarlo -> el receptor le informa al emisor cuanto espacio tiene libre en su bufer/memoria para evitar que el emisor le envie datos mas rapido de lo que puede procesar -> si los segmentos toman rutas distintas en internet y llegan desordenados, el receptor usa los numeros de secuencia para reconstruir el mensaje original antes de entregarlo a la aplicacion) -> para el cierre de conexion cuando ya termina la transmision de datos, ambos extremos cierran el canal de forma ordenada para liberar recursos (el dispositivo A avisa que ya no tiene datos para transmitir -> el que envió el ack confirma que recibió el aviso de cierre -> cuando termina sus envios pendientes, tambien envia confirmacion de cierre -> el dispositivo A confirma lo ultimo y la conexion se cierra por completo)).

- localhost es un nombre de dominio que significa "en esta misma pc", funcionando como una direccion especial que permite a un dispositivo conectarse consigo mismo a travez de la red, sin salir a internet ni usar una tarjeta de red fisica teniendo por defecto una direccion 127.0.0.1 en ipv4 y en ipv6 ::1. 

- al ejecutar el docker compose up, docker crea automaticamente una red aislada (bridge) y asigna una ip privada a cada contenedor, docker levanta un dns interno en la direccion 127.0.0.11 para que cuando un contenedor "pregunte" por el nombre de otro servicio definido en el docker-compose.yml el dns traduce ese nombre a la ip interna del contenedor.

- en puertos internos de docker, solo en esa red interna se pueden comunicar los puertos, cuando es externa estos puertos son expuestos hacia mi computadora pudiendo comunicarse con los puertos ya no aislados por docker.