const express = require("express");
const profileRouter = express.Router();
// middleware;
const isLogin = require("../middleware/isLogin");
const allowedRole = require("../middleware/allowRole");
const multer = require("multer");
// validasi muulter sebelum masuk kedatabase
const cloudinaryUploader = require("../middleware/cloudinaryProfile");
const { diskUpload, memoryUpload } = require("../middleware/upload");

function uploadFile(req, res, next) {
  memoryUpload.single("image")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log(err);
      return res.status(400).json({ msg: err.message });
    } else if (err) {
      return res.json({ msg: err.message });
    }
    next();
  });
}
const {
  getDataUserId,
  editProfile,
  deleted,
} = require("../controller/profile");

profileRouter.get("/", isLogin(), allowedRole("user", "admin"), getDataUserId);
profileRouter.patch(
  "/",
  isLogin(),
  allowedRole("user"),
  uploadFile,
  cloudinaryUploader,
  editProfile
);
profileRouter.delete("/:user_id", deleted);
module.exports = profileRouter;
