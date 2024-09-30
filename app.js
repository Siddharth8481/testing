const express = require("express");
const app = express();
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const i18n = require("i18n");
const https = require("https");
const fs = require("fs");
const cron = require("node-cron");

i18n.configure({
  locales: ["en", "ar"], // your languages
  directory: path.join(__dirname, "./localization"),
  defaultLocale: "en",
  objectNotation: true,
});

app.use(i18n.init);

//express routes
const router = express.Router();

// configuration of cors
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

//json and urlencoded
app.use(express.json());
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// generate custom token
morgan.token("host", function (req) {
  return req.hostname;
});

app.use(
  morgan(":method :host :url :status :res[content-length] - :response-time ms")
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var port = process.env.PORT || 7000;

const server = http.createServer(app);

// const server = https.createServer(
//     {
//         key: fs.readFileSync("private.key.pem"),
//         cert: fs.readFileSync("domain.cert.pem"),
//     },
//     app
// );

//database file
require("./config/database");
app.use("/public", express.static(path.join("./public")));
app.use("/css", express.static(path.join("./css")));
app.use("/views", express.static(path.join("./views")));

/////////////////////////////////// Socket Routes //////////////////////////////////
var socketio = require("socket.io")(server);
require("./socket/v1")(socketio);

app.use("/", router);
/////////////////////////////////// Admin Routes //////////////////////////////////
app.use(require("./api/routes/admin/v1"));

/////////////////////////////////// App Routes ///////////////////////////////////
/////////////////////////////////// V1 ///////////////////////////////////
app.use(require("./api/routes/app/v1"));

server.listen(port, () => {
  console.log(`Server listning at port : ${port}`);
});
