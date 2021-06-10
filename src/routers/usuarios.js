const router = require("express").Router();
const Sequelize = require("sequelize");
const { DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT } = process.env;
const sequelize = new Sequelize(`mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
const { validacion_token, is_admin } = require("../middlewares/index");

const {
	generarToken,
	filtrarCamposVacios,
	validacionParametro,
	compararIdUsuario,
	filtroInfoSensi,
} = require("../services/service");

router.post("/", async (req, res, next) => {
	let { username, password, nombre, apellido, email, telefono, direccion, isAdmin} = req.body;
	if(!isAdmin){
		isAdmin=false
	}else{
		isAdmin=true
	}
	try {
		const existe_username = await validacionParametro("usuarios", "username", username);
		const existe_email = await validacionParametro("usuarios", "email", email)
		if (existe_username) {
			res.status(409).json("Username ya existe, intente con otro username");
			return;
		}
		if (existe_email) {
			res.status(409).json("Email ya existe, intente con otro email");
			return;
		}
		if (username && password && nombre && apellido && email && telefono && direccion) {
			const insert = await sequelize.query(
				"INSERT INTO usuarios (username, password, nombre, apellido, email, telefono, direccion, is_admin) VALUES (:username, :password, :nombre,  :apellido," +
					":email, :telefono, :direccion, :isAdmin)",
				{ replacements: { username, password, nombre, apellido, email, telefono, direccion, isAdmin } }
			);
			res.status(200).json("Usuario Creado Correctamente");
		} else {
			res.status(400).json("Error validando la informacion");
		}
	} catch (error) {
		console.log(error);
		next(new Error(error));
	}
});
router.post("/login", async (req, res, next) => {
	const { username, email, password } = req.body;
	try {
		const usernameEncontrado = await validacionParametro("usuarios", "username", username);
		const emailEncontrado = await validacionParametro("usuarios", "email", email);
		if (usernameEncontrado.is_disabled || emailEncontrado.is_disabled) {
			res.status(401).json("El Usuario esta deshabilitado");
		} else if (usernameEncontrado.password === password) {
			const token = generarToken({
				username: usernameEncontrado.username,
				id: usernameEncontrado.id,
				is_admin: usernameEncontrado.is_admin,
				is_disabled: usernameEncontrado.is_disabled,
			});
			res.status(200).json(token);
		} else if (emailEncontrado.password === password) {
			const token = generarToken({
				username: emailEncontrado.username,
				id: emailEncontrado.id,
				is_admin: emailEncontrado.is_admin,
				is_disabled: emailEncontrado.is_disabled,
			});
			res.status(200).json(token);
		} else {
			res.status(400).json("Verifica, Username o Password Incorrecto");
		}
	} catch (error) {
		next(new Error(error));
	}
});
router.get("/", validacion_token, async (req, res, next) => {
	const id = req.token_info.id;
	const is_admin = req.token_info.is_admin;
	try {
		let filtroUsuarios = [];
		if (is_admin) {
			const usuariosEncontrados = await validacionParametro("usuarios", true, true, true);
			filtroUsuarios = usuariosEncontrados.map((user) => {
				delete user.password;
				return user;
			});
		} else {
			const usuarioEncontrado = await validacionParametro("usuarios", "id", id, true);
			filtroUsuarios = usuarioEncontrado.map((user) => {
				delete user.password;
				return user;
			});
		}
		if (filtroUsuarios.length) {
			res.status(200).json(filtroUsuarios);
		} else {
			res.status(404).json("Usuario no Encontrado");
		}
	} catch (error) {
		next(new Error(error));
	}
});

router.get("/:username", validacion_token, is_admin, async (req, res, next) => {
	const username = req.params.username;
	try {
		let usuarioEncontrado = await validacionParametro("usuarios", "username", username, true);
		if (usuarioEncontrado.length) {
			usuarioFiltro = filtroInfoSensi(usuarioEncontrado, ["password"]);
			res.status(200).json(usuarioFiltro);
		} else {
			res.status(404).json("Usuario no Encontrado");
		}
	} catch (error) {
		next(new Error(error));
	}
});
router.put("/:username", validacion_token, is_admin, async (req, res, next) => {
	const username = req.params.username;
	console.log(username)
	try {
		const usuarioEncontrado = await validacionParametro("usuarios", "username", username);
		const id = usuarioEncontrado.id;
		if (usuarioEncontrado) {
			const { username, password, nombre, apellido, email, telefono, direccion, is_disabled } = req.body;

			const existeUsuario = await validacionParametro("usuarios", "username", username, true);
			const existeEmail = await validacionParametro("usuarios", "email", email, true);

			const usernameRepetido =
				existeUsuario && existeUsuario.map((user) => compararIdUsuario(id, user.id));
			const emailRepetido =
				existeEmail && existeEmail.map((user) => compararIdUsuario(id, user.id));

			if (usernameRepetido && usernameRepetido.some((value) => value === true)) {
				res.status(409).json("El Username ya Existe, Intenta con Otro");
				return;
			}
			if (emailRepetido && emailRepetido.some((value) => value === true)) {
				res.status(409).json("El Email ya Existe, Intenta con Otro");
				return;
			}

			const filtradoCampos = filtrarCamposVacios({
				username,
				password,
				nombre,
				apellido,
				email,
				telefono,
				direccion,
				is_disabled,
			});
			const updatedUser = { ...usuarioEncontrado, ...filtradoCampos };
			const update = await sequelize.query(
				`UPDATE usuarios SET username = :username, password = :password, nombre = :nombre, apellido = :apellido, email = :email, telefono = :telefono, direccion = :direccion, is_disabled = :is_disabled WHERE id = :id`,
				{
					replacements: {
						username: updatedUser.username,
						password: updatedUser.password,
						nombre: updatedUser.nombre,
						apellido: updatedUser.apellido,
						email: updatedUser.email,
						telefono: updatedUser.telefono,
						direccion: updatedUser.direccion,
						id: id,
						is_disabled: updatedUser.is_disabled,
					},
				}
			);
			res.status(200).json(`El Usuario ${username} Ha sido Modificado Correctamente`);
		} else {
			res.status(404).json("Usuario no Encontrado");
		}
	} catch (error) {
		next(new Error(error));
	}
});
router.delete("/:username", validacion_token, is_admin, async (req, res, next) => {
	const username = req.params.username;
	try {
		const usuarioEncontrado = await validacionParametro("usuarios", "username", username);
		const id = usuarioEncontrado.id;
		if (!usuarioEncontrado) {
			res.status(404).json("Usuario no Encontrado");
			return;
		}
		const update = await sequelize.query("UPDATE usuarios SET is_disabled = true WHERE id = :id", {
			replacements: {
				id: id,
			},
		});
		res.status(200).json(`El Usuario ${username} Se ha Deshabilitado Correctamente`);
	} catch (error) {
		next(new Error(error));
	}
});

module.exports = router;
