
const express = require("express");
const server = express();



require("dotenv").config();

const port = process.env.PORT || 3000;

console.log(process.env.PORT)
console.log(process.env.DB_NAME)

const usuario = require("./src/routers/usuarios");
const producto = require("./src/routers/productos");
const orden = require("./src/routers/ordenes");

server.use(express.json())
server.listen(port, () => {
	const date = new Date();
	console.log(`inicio el server - time ${date} on port ${port}`);
});

server.use("/usuarios", usuario);
server.use("/productos", producto);
server.use("/ordenes", orden);

server.use((err, req, res, next) => {
	if (!err) return next();
	console.log("Ha Ocurrido un Error", err);
	res.status(500).json(err.message);
	throw err;
});
