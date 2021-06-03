
const express = require("express");
const server = express();


if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}
const port = process.env.PORT || 3000;




server.use(express.json())
server.listen(port, () => {
	const date = new Date();
	console.log(`inicio el server - time ${date} on port ${port}`);
});


server.use((err, req, res, next) => {
	if (!err) return next();
	console.log("An error has occurred", err);
	res.status(500).json(err.message);
	throw err;
});
