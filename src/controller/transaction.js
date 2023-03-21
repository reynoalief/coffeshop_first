const transactionRepo = require("../repo/transaction");
const sendResponse = require("../helper/response");

const get = async (req, res) => {
  try {
    const response = await transactionRepo.getALL();
    sendResponse.success(res, 200, {
      data: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, "Internal Server Error");
  }
};
const historyUser = async (req, res) => {
  try {
    const response = await transactionRepo.historyTransactions(
      req.userPayload.id,
      req.query
    );

    sendResponse.success(res, 200, {
      data: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, "Internal Server Error");
  }
};

const create = async (req, res) => {
  try {
    const response = await transactionRepo.createTransactions(
      req.body,
      req.userPayload.id
    );
    sendResponse.success(res, 201, {
      result: {
        msg: (response.text = "Transaction created successfully."),
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
    const response = await transactionRepo.edit(req.body, req.params);
    sendResponse.success(res, 201, {
      result: {
        msg: (response.text = "Transaction has ben changed"),
        data: response.rows,
      },
    });
  } catch (err) {
    console.log(err);
    sendResponse.error(res, 500, "Internal Server Error");
  }
};

const deleted = async (req, res) => {
  try {
    const response = await transactionRepo.dropTransactions(req.params);
    sendResponse.success(res, 202, {
      msg: (response.text = "Transaction delete succesfully"),
      delete: response.rows,
    });
  } catch (err) {
    sendResponse.error(res, 500, "Internal Server Error");
  }
};

const transactionController = {
  get,
  historyUser,
  create,
  edit,
  deleted,
};
module.exports = transactionController;
