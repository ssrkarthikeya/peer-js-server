import 'dotenv/config';

import { fileURLToPath } from "url";
import http from "http";
import { ExpressPeerServer } from "peer";

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import adminRouter from "./routes/admin.js";
import clientRouter from "./routes/index.js";
import { addClient, removeClient } from "./clientManager.js";

console.log("Server starting...");

const app = express();

app.use(cors());

// Custom Morgan logger to only log errors for /clients API
const clientErrorLogger = logger("dev", {
  skip: function (req, res) {
    return req.url != '/clients';
  }
});
app.use(clientErrorLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/admin", adminRouter);
app.use("/clients", clientRouter);

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../dist")));

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/",
  allow_discovery: true,
});

app.use("/peerjs", peerServer);

server.listen(port);

server.on("error", onError);
server.on("listening", onListening);

peerServer.on("connection", (client) => {
  addClient(client); // Pass the full client object
});

peerServer.on("disconnect", (client) => {
  removeClient(client.getId());
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

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
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
}

export default app;
