
const { validacionParametro } = require("../services/service");

const jwt = require("jsonwebtoken");


require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "firmaSegura";

async function validacion_token(req, res, next) {
	const token = req.headers.authorization.split(" ")[1];

	try {
		const verificacion = jwt.verify(token, JWT_SECRET);
		const usuarioEncontrado = await validacionParametro("usuarios", "id", verificacion.id);
		const isDisabled = !!usuarioEncontrado.is_disabled;
		if (isDisabled) {
			res.status(401).json("No Autorizado - Usuario Deshabilitado");
		} else {
			req.token_info = verificacion;
			next();
		}
	} catch (e) {
		res.status(401).json("No Autorizado - token Invalido");
	}
}
function is_admin(req, res, next) {
	req.token_info.is_admin ? next() : res.status(401).json("No Autorizado - No es Administrador");
}

module.exports = { validacion_token, is_admin };
