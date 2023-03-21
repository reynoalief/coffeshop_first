const express = require("express");
const transactionRouter = express.Router();

// middleware
const isLogin = require("../middleware/isLogin");
const allowRole = require("../middleware/allowRole");

const {
  get,
  historyUser,
  create,
  edit,
  deleted,
} = require("../controller/transaction");

transactionRouter.get(
  "/history",
  isLogin(),
  allowRole("user", "admin"),
  historyUser
);
transactionRouter.get("/all", isLogin(), allowRole("admin"), get);
transactionRouter.post("/add", isLogin(), allowRole("user"), create);
transactionRouter.patch("/:id", isLogin(), allowRole("admin"), edit);
transactionRouter.delete(
  "/:id",
  isLogin(),
  allowRole("admin", "user"),
  deleted
);

module.exports = transactionRouter;
