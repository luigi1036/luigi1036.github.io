--Crear Esquema
CREATE SCHEMA `delilah_resto` ;

-- Crear Tablas
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR (60) NOT NULL,
  password VARCHAR (60) NOT NULL,
  nombre VARCHAR(60) NOT NULL,
  apellido VARCHAR(60) NOT NULL,
  email VARCHAR(60) NOT NULL,
  telefono VARCHAR(10) NOT NULL,
  direccion VARCHAR (60) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_disabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR (60) NOT NULL,
  precio FLOAT NOT NULL,
  url VARCHAR(200) NOT NULL,
  descripcion VARCHAR(150) NOT NULL,
  is_disabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE ordenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estado VARCHAR(60) NOT NULL,
  fecha DATETIME NOT NULL,
  descripcion VARCHAR(150) NOT NULL,
  metodo_pago VARCHAR (60) NOT NULL,
  total FLOAT NOT NULL,
  user_id INT NOT NULL DEFAULT "0",
  is_disabled BOOLEAN DEFAULT FALSE,
  FOREIGN KEY(user_id) REFERENCES usuarios(id)
);

CREATE TABLE ordenes_productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orden_id INT,
  producto_id INT,
  cantidad_producto INT NOT NULL,
  FOREIGN KEY(orden_id) REFERENCES ordenes(id),
  FOREIGN KEY(producto_id) REFERENCES productos(id)
);

-- Datos Usuarios
INSERT INTO
  usuarios
VALUES
  (
    NULL,
    "luis1036",
    "l123456",
    "Luis",
    "Serna"
    "lserna@correo.com",
    "1234567890",
    "Calle 42c",
    TRUE,
    FALSE
  ),
  (
    NULL,
    "samu0712",
    "s123456",
    "samuel",
    "serna"
    "sserna@correo.com",
    "5555896742",
    "carrera 33c",
    FALSE,
    FALSE
  ),
  (
    NULL,
    "usuario",
    "usuario123",
    "usuario",
    "apellidouser"
    "correoprueba@correo.com",
    "0106926593",
    "calle 34",
    FALSE,
    FALSE
  );

-- Datos Productos
INSERT INTO
  productos
VALUES
  (
    NULL,
    "Bagel de salmón",
    425,
    "resources/_images/bagel_salmon",
    "salmón al estilo Gravlax, tomate o cebolla",
    FALSE
  ),
  (
    NULL,
    "Hamburguesa clásica",
    350,
    "resources/_images/hamburguesa_clasica",
    "Dos medallones de carne con cheddar y bacon entre 2 panes Brioche y con una porción de papas fritas",
    FALSE
  ),
  (
    NULL,
    "Ensalada veggie",
    340,
    "resources/_images/ensalada_veggie",
    "Ensalada de lechuga romana con salsa césar, crutones tostados y queso parmesano",
    FALSE
  ),
  (
    NULL,
    "Sandwich veggie",
    310,
    "resources/_images/sandwich_veggie",
    "sandwich vegetariano",
    FALSE
  ),
  (
    NULL,
    "Focaccia",
    300,
    "resources/_images/foccacia",
    "Ensalada de lechuga romana con salsa césar, crutones tostados, pollo a la plancha y queso parmesano",
    FALSE
  ),
  (
    NULL,
    "Sandwich Focaccia",
    350,
    "resources/_images/sandwich_foccacia",
    "sandwich grande de jamón y ananá de 8 porciones",
    FALSE
  );

-- Datos Ordenes
INSERT INTO
  ordenes
VALUES
  (
    NULL,
    "entregado",
    NOW(),
    "1x Hamburguesa clásica",
    "tarjeta",
    350,
    1,
    FALSE
  ),
  (
    NULL,
    "cancelado",
    NOW(),
    "1x Sandwich Focaccia",
    "tarjeta",
    350,
    3,
    FALSE
  ),
  (
    NULL,
    "Despachado",
    NOW(),
    "1x Sandwich veggie",
    "efectivo",
    310,
    1,
    FALSE
  ),
  (
    NULL,
    "preparando",
    NOW(),
    "2x Bagel de salmón",
    "efectivo",
    850,
    3,
    FALSE
  ),
  (
    NULL,
    "confirmado",
    NOW(),
    "1x Bagel de salmón",
    "tarjeta",
    425,
    2,
    FALSE
  ),
  (
    NULL,
    "nuevo",
    NOW(),
    "1x Hamburguesa clásica",
    "efectivo",
    350,
    1,
    FALSE
  );

-- Datos ordenes_productos
INSERT INTO
  ordenes_productos
VALUES
  (NULL, 1, 2, 1),
  (NULL, 2, 6, 1),
  (NULL, 3, 4, 1),
  (NULL, 4, 1, 2),
  (NULL, 5, 1, 1),
  (NULL, 6, 2, 1);

