require("dotenv").config();
//require("./src/config/redis");
const express = require("express");
const morgan = require("morgan");

// cors untuk menerima perizin preflights
const cors = require("cors");
const corsOptions = {
  "Access-Control-Allow-Origin": "*",
  credentials: true,
  optionsSuccesssStatus: 200,
};

// importdb
const postgresDb = require("./src/config/postgre");
// import mainRouter
const mainRouter = require("./src/routes/main");
// init express application
const server = express();
const PORT = 5000;

postgresDb
  .connect()
  .then(() => {
    // pasang parser untuk body
    console.log("Server Connected...!");
    //cors options
    server.use(express.urlencoded({ extended: false }));
    server.use(express.json());
    server.use(cors(corsOptions));
    server.use(express.static("./public")); // => data yang dipakai buat router get
    // user router mainRouter
    server.use(
      morgan(":method :url :status :res[content-length] - :response-time ms")
    );
    server.use(mainRouter);
    // server ready menerima request di port
    server.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
