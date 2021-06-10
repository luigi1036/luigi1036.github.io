
const router = require("express").Router();

const Sequelize = require("sequelize");
const { DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT } = process.env;
const sequelize = new Sequelize(`mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
console.log(DB_USER)

const { validacion_token, is_admin } = require("../middlewares/index");
const { filtrarCamposVacios, validacionParametro } = require("../services/service");

router.get("/", validacion_token, async (req, res, next) => {
	const productos = await validacionParametro("productos", "is_disabled", false, true);
	res.status(200).json(productos);
});
router.post("/", validacion_token, is_admin, async (req, res, next) => {
	const { nombre, precio, url, descripcion } = req.body;
	try {
		if (nombre && precio && url && descripcion) {
			const insert = await sequelize.query(
				"INSERT INTO productos (nombre, precio, url, descripcion) VALUES (:nombre, :precio, :url, :descripcion)",
				{ replacements: { nombre, precio, url, descripcion } }
			);
			console.log("Producto Agregado a la DB", insert);
			res.status(200).json(insert);
		} else {
			res.status(400).json("Error Validando la Informacion");
		}
	} catch (error) {
		next(new Error(error));
	}
});
router.get("/:id", validacion_token, async (req, res, next) => {
	const id = req.params.id;
	const productoEncontrado = await validacionParametro("productos", "id", id);
	productoEncontrado ? res.status(200).json(productoEncontrado) : res.status(404).json("Ningun Producto Coincide con la busqueda");
});
router.put("/:id", validacion_token, is_admin, async (req, res, next) => {
	const id = req.params.id;
	try {
		const productoEncontrado = await validacionParametro("productos", "id", id);
		if (productoEncontrado) {
			const { nombre, precio, url, descripcion, is_disabled } = req.body;
			const filtradoCampos = filtrarCamposVacios({ nombre, precio, url, descripcion, is_disabled });
			const productoActualizar = { ...productoEncontrado, ...filtradoCampos };
			const update = await sequelize.query(
				"UPDATE productos SET nombre = :nombre, precio = :precio, url = :url, descripcion = :descripcion, is_disabled = :is_disabled WHERE id = :id",
				{
					replacements: {
						id: id,
						nombre: productoActualizar.nombre,
						precio: productoActualizar.precio,
						url: productoActualizar.url,
						descripcion: productoActualizar.descripcion,
						is_disabled: productoActualizar.is_disabled,
					},
				}
			);
			res.status(200).json(`El Producto con el ID ${id} Se Modifico Correctamente`);
		} else {
			res.status(404).json("Ningun Producto Coincide con la busqueda");
		}
	} catch (error) {
		next(new Error(error));
	}
});
router.delete("/:id", validacion_token, is_admin, async (req, res, next) => {
	const id = req.params.id;
	try {
		const productoEncontrado = await validacionParametro("productos", "id", id);
		if (productoEncontrado) {
			const update = await sequelize.query("UPDATE productos SET is_disabled = true WHERE id = :id", {
				replacements: {
					id: id,
				},
			});
			res.status(200).json(`El Producto con el ID ${id} Se ha Deshabilitado Correctamente`);
		} else {
			res.status(404).json("Ningun Producto Coincide con la busqueda");
		}
	} catch (error) {
		next(new Error(error));
	}
});

module.exports = router;
