const express = require("express");
const promoRouter = express.Router();
const cloudinaryUploader = require("../middleware/cloudinary");
const multer = require("multer");
const { diskUpload, memoryUpload } = require("../middleware/upload");
// middleware
const isLogin = require("../middleware/isLogin");
const allowRole = require("../middleware/allowRole");
const validate = require("../middleware/validate");
const {
  get,
  create,
  edit,
  searchPromo,
  deleted,
  getId,
} = require("../controller/promo");

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
promoRouter.get("/all", get);
promoRouter.get("/search", searchPromo);
promoRouter.get("/:id", getId);
promoRouter.post("/add", isLogin(), allowRole("admin"), uploadFile,cloudinaryUploader, create);
promoRouter.patch("/:id", isLogin(), allowRole("admin"),uploadFile,
cloudinaryUploader, edit);
promoRouter.delete("/:id", isLogin(), allowRole("admin"), deleted);

module.exports = promoRouter;
