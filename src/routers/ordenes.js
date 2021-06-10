
const router = require("express").Router();

const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
const { DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT } = process.env;
const sequelize = new Sequelize(`mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

const utils = require("../utils");

const { validacion_token, is_admin } = require("../middlewares/index");

const { validacionParametro, filtroInfoSensi } = require("../services/service");

router.get("/", validacion_token, async (req, res, next) => {
	try {
		let ordenes = [];
		if (req.token_info.is_admin) {
			ordenes = await sequelize.query(
				"SELECT * FROM ordenes o INNER JOIN usuarios u ON o.user_id = u.id ORDER BY fecha DESC;",
				{
					type: QueryTypes.SELECT,
				}
			);
		} else {
			const id = req.token_info.id;
			ordenes = await sequelize.query(
				"SELECT * FROM ordenes o INNER JOIN usuarios u ON o.user_id = u.id WHERE u.id = :id ORDER BY fecha DESC;",
				{
					replacements: { id: id },
					type: QueryTypes.SELECT,
				}
			);
		}
		const detallesOrdenes = await Promise.all(
			ordenes.map(async (orden) => {
				const productoOrdenes = await sequelize.query(
					"SELECT * FROM ordenes_productos op INNER JOIN productos p WHERE orden_id = :orden_id AND op.producto_id = p.id",
					{
						replacements: { orden_id: orden.id },
						type: QueryTypes.SELECT,
					}
				);
				orden.productos = productoOrdenes;
				return orden;
			})
		);

		if (!!detallesOrdenes.length) {
			const filtradoOrdenes = filtroInfoSensi(ordenes, ["password", "is_admin", "is_disabled"]);
			res.status(200).json(filtradoOrdenes);
		} else {
			res.status(404).json("La búsqueda no arrojó ningún resultado");
		}
	} catch (error) {
		next(new Error(error));
	}
});
router.post("/", validacion_token, async (req, res, next) => {
	const user_id = req.token_info.id;
	const { data, metodo_pago } = req.body;
	try {
		const detallesOrdenes = await Promise.all(
			data.map((producto) => validacionParametro("productos", "id", producto.id))
		);

		if (detallesOrdenes.some((producto) => producto.is_disabled)) {
			res.status(403).json("Algunos de los productos seleccionados están desactivados o ya no están disponibles");
		} else if (detallesOrdenes.every((producto) => !!producto === true)) {
			const orderData = async () => {
				let total = 0;
				let descripcion = "";
				detallesOrdenes.forEach((producto, index) => {
					total += producto.precio * data[index].cantidad_producto;
					descripcion += `${data[index].cantidad_producto}x ${producto.nombre}, `;
				});
				descripcion = descripcion.substring(0, descripcion.length - 2);
				return [total, descripcion];
			};

			const [total, descripcion] = await orderData();
			const orden = await sequelize.query(
				"INSERT INTO ordenes (estado, fecha, descripcion, metodo_pago, total, user_id) VALUES (:estado, :fecha, :descripcion, :metodo_pago, :total, :user_id)",
				{
					replacements: {
						estado: "nuevo",
						fecha: new Date(),
						descripcion,
						metodo_pago: metodo_pago,
						total,
						user_id,
					},
				}
			);

			data.forEach(async (producto) => {
				console.log(producto)
				const ordenes_productos = await sequelize.query(
					"INSERT INTO ordenes_productos (orden_id, producto_id, cantidad_producto) VALUES (:orden_id, :producto_id, :cantidad_producto)",
					{ replacements: { orden_id: orden[0], producto_id: producto.id, cantidad_producto: producto.cantidad_producto } }
				);
			});

			console.log(`la Orden ${orden[0]} se Ha Creado`);
			res.status(200).json("Orden Creada Correctamente");
		} else {
			res.status(400).json("Error Validando la Informacion");
		}
	} catch (error) {
		next(new Error(error));
	}
});
router.get("/:id", validacion_token, is_admin, async (req, res, next) => {
	const id = req.params.id;
	try {
		const orden = await sequelize.query(
			"SELECT * FROM ordenes o INNER JOIN usuarios u ON o.user_id = u.id WHERE o.id = :id;",
			{
				replacements: { id: id },
				type: QueryTypes.SELECT,
			}
		);
		if (!!orden.length) {
			orden[0].productos = await sequelize.query(
				"SELECT * FROM ordenes_productos op INNER JOIN productos p WHERE orden_id = :id AND op.producto_id = p.id",
				{
					replacements: { id: orden[0].id },
					type: QueryTypes.SELECT,
				}
			);
			delete orden[0].password;
			delete orden[0].is_admin;
			delete orden[0].is_disabled;
			res.status(200).json(orden);
		} else {
			res.status(404).json("La búsqueda no arrojó ningún resultado");
		}
	} catch (error) {
		next(new Error(error));
	}
});
router.put("/:id", validacion_token, is_admin, async (req, res, next) => {
	const id = req.params.id;
	const { estadoOrden } = req.body;
	try {
		const orden = await sequelize.query("SELECT * FROM ordenes WHERE id = :id;", {
			replacements: { id: id },
			type: QueryTypes.SELECT,
		});

		if (!!orden.length) {
			if (utils.estadoOrdenes.includes(estadoOrden)) {
				const update = await sequelize.query("UPDATE ordenes SET estado = :estado WHERE id = :id", {
					replacements: {
						id: id,
						estado: estadoOrden,
					},
				});
				res.status(200).json(`La Orden con ID ${id} Se ha Modificado Correctamente`);
			} else {
				res.status(403).json("El estado dado para el producto no es válido");
			}
		} else {
			res.status(404).json("La búsqueda no arrojó ningún resultado");
		}
	} catch (error) {
		next(new Error(error));
	}
});
router.delete("/:id", validacion_token, is_admin, async (req, res, next) => {
	const id = req.params.id;
	try {
		const ordenEncontrada = await validacionParametro("ordenes", "id", id);
		if (ordenEncontrada) {
			const update = await sequelize.query("UPDATE ordenes SET is_disabled = true WHERE id = :id", {
				replacements: {
					id: id,
				},
			});
			res.status(200).json(`La Orden con el ID ${id} se ha Modificado Correctamente`);
		} else {
			res.status(404).json("La búsqueda no arrojó ningún resultado");
		}
	} catch (error) {
		next(new Error(error));
	}
});

module.exports = router;
