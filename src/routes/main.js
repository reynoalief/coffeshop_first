const express = require("express");
// import router
const userRouter = require("./user");
const profileRouter = require("./profile");
const promoRouter = require("./promo");
const productRouter = require("./product");
const deliveryRouter = require("./delivery");
const transactionRouter = require("./transaction");
const authRouter = require("./auth");
// import middleware
const {
  diskUpload,
  memoryUpload,
  errorHandler,
} = require("../middleware/upload");
const cloudinaryUploader = require("../middleware/cloudinary");

// main router
const mainRouter = express.Router();
const prefix = "/api"; //prefix

mainRouter.use(`${prefix}/user`, userRouter);
mainRouter.use(`${prefix}/profile`, profileRouter);
mainRouter.use(`${prefix}/promos`, promoRouter);
mainRouter.use(`${prefix}/product`, productRouter);
mainRouter.use(`${prefix}/delivery`, deliveryRouter);
mainRouter.use(`${prefix}/transaction`, transactionRouter);
mainRouter.use(`${prefix}/auth`, authRouter);
// upload file umum
mainRouter.post(
  "/cloud",
  (req, res, next) =>
    memoryUpload.single("image")(req, res, (err) => {
      errorHandler(err, res, next);
    }),
  cloudinaryUploader,
  (req, res) => {
    console.log(req.file);
    res.status(200).json({
      msg: "Upload Success",
      data: {
        url: req.file.url,
        secure: req.file.secure_url,
        data: req.file.filename,
      },
    });
  }
);
mainRouter.get(`/`, (req, res) => {
  res.json({
    msg: `Deploy Connected Success`,
  });
});

module.exports = mainRouter;
