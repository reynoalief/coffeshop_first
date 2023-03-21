const express = require("express");
const userRouter = express.Router();
const isLogin = require("../middleware/isLogin");
const allowRole = require("../middleware/allowRole");
const validate = require("../middleware/validate");
// isLogin() <= middleware, ngunci endpoint harus login
const {
  get,
  getId,
  register,
  editPassword,
  deleted,
} = require("../controller/user");
userRouter.get("/all", isLogin(), allowRole("admin"), get);
userRouter.get("/", isLogin(), allowRole("admin", "user"), getId);
userRouter.post("/register", register);
userRouter.patch("/edit", isLogin(), allowRole("user", "admin"), editPassword);
userRouter.delete("/:user_id", isLogin(), allowRole("admin"), deleted);
module.exports = userRouter;
