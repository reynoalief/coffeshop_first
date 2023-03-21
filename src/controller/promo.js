const promoRepo = require("../repo/promo");
const sendResponse = require("../helper/response");

const get = async (req, res) => {
  try {
    const response = await promoRepo.get();
    sendResponse.success(res, 200, {
      data: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, "Internal Server Error");
  }
};
const searchPromo = async (req, res) => {
  try {
    const response = await promoRepo.searchPromo(req.query);
    sendResponse.success(res, 200, {
      data: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, "Internal Server Error");
  }
};

const create = async (req, res) => {
  try {
    const response = await promoRepo.create(req.body, req.file.secure_url);
    sendResponse.success(res, 201, {
      result: {
        msg: (response.text = "Promo created successfully."),
        data: response.rows,
      },
    });
  } catch (err) {
    console.log(err);
    sendResponse.error(res, 500, "Internal Server Error");
  }
};

const edit = async (req, res) => {
  try {
    if (req.file) {
      req.body.image = req.file.secure_url;
    }
    const response = await promoRepo.edit(req.body, req.params);
    sendResponse.success(res, 201, {
      result: {
        msg: (response.text = "Promo has ben changed"),
        data: response.rows,
      },
    });
  } catch (err) {
    console.log(err);
    sendResponse.error(res, 500, err.message || "Internal Server Error");
  }
};

const deleted = async (req, res) => {
  try {
    const response = await promoRepo.deleted(req.params);
    sendResponse.success(res, 202, {
      msg: (response.text = "Promo delete succesfully"),
      delete: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, "Internal Server Error");
  }
};

const getId = async (req, res) => {
  try {
    const response = await promoRepo.getId(req.params);
    sendResponse.success(res, 202, {
      data: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, err);
  }
};

const sizeController = {
  get,
  getId,
  create,
  searchPromo,
  edit,
  deleted,
};
module.exports = sizeController;
