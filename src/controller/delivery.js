const deliveryRepo = require("../repo/delivery");
const sendResponse = require("../helper/response");

const get = async (req, res) => {
  try {
    const response = await deliveryRepo.get();
    sendResponse.success(res, 200, {
      data: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, "Internal Server Error");
  }
};

const create = async (req, res) => {
  try {
    const response = await deliveryRepo.create(req.body);
    sendResponse.success(res, 201, {
      result: {
        msg: (response.text = "Delivery created successfully."),
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
    const response = await deliveryRepo.edit(req.body, req.params);
    sendResponse.success(res, 201, {
      result: {
        msg: (response.text = "Delivery has ben changed"),
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
    const response = await deliveryRepo.deleted(req.params);
    sendResponse.success(res, 202, {
      msg: (response.text = "Delivery delete succesfully"),
      delete: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, "Internal Server Error");
  }
};
const deliveryController = {
  get,
  create,
  edit,
  deleted,
};
module.exports = deliveryController;
