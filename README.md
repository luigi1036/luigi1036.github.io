# "Delilah Restó", Backen de pedidos para el Restaurante


## Recursos y tecnologías utilizadas

- Node.js
- Nodemon
- Express
- JWT para autenticación via Token
- MySQL
- Sequelize
- Postman para manejo de endpoints y testing
- Swagger para documentación de API

El objetivo principal del trabajo es generar el backend de una app de pedidos de comida llamada Delilah Restó, usando bases de datos relacionales, endpoints funcionales y documentación.

## Documentación de la API

Abrir el archivo `/documentacion/documentacion.yaml` y copiar su contenido en [Swagger](https://editor.swagger.io/)

Se listarán los endpoints y métodos disponibles y la información necesaria para hacer uso de los mismos

## Instalación e inicializacion del proyecto

### 1 - Clonar proyecto

Clonar el repositorio desde el [siguiente link](https://github.com/luigi1036/luigi1036.github.io).

Desde la consola con el siguiente link:

`git clone https://github.com/luigi1036/luigi1036.github.io.git .`

### 2 - Instalación de dependencias

```
npm install
```

### 3 - Creando base de datos

- Abrir XAMPP y verificar que el puerto sobre el cual se está ejecutando es el `3306`
- Inicializar los servicios de Apache y MySQL
- Abrir el panel de control del servicio MySQL
- Generar una nueva base de datos llamada `delilah_resto` desde el panel de control
- Abrir el archivo en `/basedatos/querys.sql` y dentro del `panel de control` de la base de datos ejecutar la serie de queries del archivo.

### 4 - Iniciando el servidor

Utilizar el comando `npm start` para inicializar el servidor
