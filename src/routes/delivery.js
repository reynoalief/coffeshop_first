const express = require("express");
const deliveryRouter = express.Router();
const { get, create, edit, deleted } = require("../controller/delivery");
const isLogin = require("../middleware/isLogin");
const allowRole = require("../middleware/allowRole");
deliveryRouter.get("/", get);
deliveryRouter.post("/add", isLogin(), allowRole("admin"), create);
deliveryRouter.patch("/:id", isLogin(), allowRole("admin"), edit);
deliveryRouter.delete("/:id", isLogin(), allowRole("admin"), deleted);

module.exports = deliveryRouter;
