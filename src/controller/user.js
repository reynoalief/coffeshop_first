const userRepo = require("../repo/user");
const sendResponse = require("../helper/response");

const get = async (req, res) => {
  try {
    const response = await userRepo.get();
    sendResponse.success(res, 200, {
      data: response.rows,
    });
  } catch (error) {
    sendResponse.error(res, 500, "Internal Server Error");
  }
};
const getId = async (req, res) => {
  try {
    const response = await userRepo.getId(req.userPayload.id);
    sendResponse.success(res, 200, {
      data: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, "Internal Server Error");
  }
};

const register = async (req, res) => {
  try {
    const response = await userRepo.register(req.body);
    sendResponse.success(res, 201, {
      result: {
        msg: (response.text = "account created successfully."),
        data: response.data,
      },
    });
  } catch (err) {
    console.log(err);
    console.log(err.detail);
    sendResponse.error(res, 500, {
      err: err,
      msg: err.detail,
    });
  }
};

const editPassword = async (req, res) => {
  try {
    const response = await userRepo.editPassword(req.body, req.userPayload.id);
    sendResponse.success(res, 201, {
      result: {
        msg: (response.text = "Password has ben changed"),
        data: null,
      },
    });
  } catch (objErr) {
    const statusCode = objErr.status || 500;
    sendResponse.error(res, statusCode, {
      msg: objErr.err.message,
    });
  }
};

const deleted = async (req, res) => {
  try {
    const response = await userRepo.deleted(req.params);
    sendResponse.success(res, 202, {
      msg: (response.text = "data delete succesfully"),
      delete: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, {
      msg: "Internal Server Error",
    });
  }
};
const userController = {
  get,
  getId,
  register,
  editPassword,
  deleted,
};
module.exports = userController;
