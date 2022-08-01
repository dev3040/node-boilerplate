const mongoose = require('mongoose');
const express = require("express");
// const statusCode = require("./src/config/statuscode");
const path = require("path");
const http = require("http");

//to accesss values from env files
require("dotenv").config({path: path.join(__dirname, `./.env.${process.env.NODE_ENV}`)});


const routes = require("./routes/routes");


const config = require("./config/connection")
// To connect with mongodb database
const username=config.username
const password=config.password
const dbName=config.dbName
const cluster=config.cluster

mongoose.connect(`mongodb+srv://${username}:${password}@${cluster}.ndr4g.mongodb.net/${dbName}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

//Setup Express App
const app = express();

//to parse the body with post method
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
//for CORS
app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "*");
	req.header("Content-Type", "application/json");
	res.setHeader("Access-Control-Allow-Credentials", true);
	next();
});

// to use the routes of express
app.use("/api", routes);
// app.use("/uploads", express.static("uploads"));

//centralized Error handling 
app.use((error, request, response, next) => {
	response.status(500).send();
	next();
});

let port = process.env.PORT || "3000";
app.set("port", port);
let server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function onError(error) {
	if (error.syscall !== "listen") throw error;

	let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges");
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(bind + " is already in use");
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	let addr = server.address();
	const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
	console.log(`Listening on ${bind}`);
}