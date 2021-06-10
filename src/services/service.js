
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
const { DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT } = process.env;
const sequelize = new Sequelize(`mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
const jwt = require("jsonwebtoken");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "firmaSegura";


function generarToken(info) {
	return jwt.sign(info, JWT_SECRET, { expiresIn: "1h" });
}
function filtrarCamposVacios(inputObject) {
	Object.keys(inputObject).forEach((key) =>
		!inputObject[key] && delete inputObject[key]);
		return inputObject;

}
async function validacionParametro(table, tableParam = "TRUE", inputParam = "TRUE", all = false) {
	const searchResults = await sequelize.query(`SELECT * FROM ${table} WHERE ${tableParam} = :replacementParam`, {
		replacements: { replacementParam: inputParam },
		type: QueryTypes.SELECT,
	});
	return !!searchResults.length ? (all ? searchResults : searchResults[0]) : false;
}
function compararIdUsuario(id, idUsuario) {
	if (id !== idUsuario) {
		console.log("Base User ID:", id, "Found User ID:", idUsuario);
		console.log("username Diferente, mismos datos");
		return true;
	} else {
		return false;
	}
}
function filtroInfoSensi(objetos, filtros) {
	return objetos.map((objeto) => { 
		filtros.forEach(filtro => delete objeto[filtro] )
		return objeto;
	});
}

module.exports = {
	generarToken,
	filtrarCamposVacios,
	validacionParametro,
	compararIdUsuario,
	filtroInfoSensi,
};
