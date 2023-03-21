const express = require("express");
const productRouter = express.Router();
const isLogin = require("../middleware/isLogin");
const allowRole = require("../middleware/allowRole");
const cloudinaryUploader = require("../middleware/cloudinary");

// const validate = require("../middleware/validate");
const multer = require("multer");
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
// mainRouter.post(
//    "/cloud",
//    (req, res, next) =>
//       memoryUpload.single("image")(req, res, (err) => {
//          errorHandler(err, res, next);
//       }),
//    cloudinaryUploader
// );
const {
  filter,
  create,
  edit,
  deleted,
  getId,
  getAll,
} = require("../controller/product");

productRouter.get("/filter", filter);
productRouter.get("/", getAll);
productRouter.post(
  "/add",
  isLogin(),
  allowRole("admin"),
  uploadFile,
  cloudinaryUploader,
  create
);

productRouter.patch(
  "/:id",
  isLogin(),
  allowRole("admin"),
  uploadFile,
  cloudinaryUploader,
  edit
);
productRouter.delete("/:id", isLogin(), allowRole("admin"), deleted);
productRouter.get("/:id", getId);

module.exports = productRouter;
