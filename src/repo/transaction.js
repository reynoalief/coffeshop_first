const postgreDb = require("../config/postgre.js");

const getALL = () => {
  return new Promise((resolve, reject) => {
    const query = `select transactions.id ,users.email,products.image, products.name,promos.code,delivery.method, qty, tax, total, status 
      from transactions 
      inner join users on transactions.user_id = users.id
      inner join products on transactions.product_id = products.id 
      inner join promos on transactions.promo_id = promos.id
      inner join delivery on delivery.id = transactions.delivery_id 
      where transactions.user_id = users.id order by transactions.id asc`;
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

// const historyTransactions = (token) => {
//     return new Promise((resolve, reject) => {
//         let query = "select users.email, product.name, transactions.total, transactions.status from transactions inner join users on users.id = transactions.user_id inner join product on product.id = transactions.product_id where users.id = $1";

//         postgreDb.query(query, [token], (err, result) => {
//             if (err) {
//                 console.log(err);
//                 return reject(err);
//             }
//             return resolve(result);
//         });

//     })
// }

const historyTransactions = (token, queryparams) => {
  return new Promise((resolve, reject) => {
    let query = `select transactions.id,transactions.user_id,users.email,products.image, products.name qty, tax, total, status 
    from transactions 
    inner join users on transactions.user_id = users.id
    inner join products on transactions.product_id = products.id 
    where transactions.user_id = '${token}'`;

    let queryLimit = "";
    let link = `http://localhost:5000/api/transaction/history?`;
    let values = [token];
    if (queryparams.page && queryparams.limit) {
      let page = parseInt(queryparams.page);
      let limit = parseInt(queryparams.limit);
      let offset = (page - 1) * limit;
      queryLimit = query + ` limit '${limit}' offset '${offset}'`;
      values.push(limit, offset);
    } else {
      queryLimit = query;
    }

    // console.log(queryLimit);
    postgreDb.query(query, (err, result) => {
      if (err) {
        return reject(new Error("Internal Server Error"));
      }
      postgreDb.query(queryLimit, (err, queryresult) => {
        // console.log(queryresult);
        if (err) {
          return reject(err);
        }
        // console.log(queryresult);
        // console.log(queryLimit);
        if (queryresult.rows.length == 0) {
          return reject(new Error("History Not Found"));
        }

        let resNext = null;
        let resPrev = null;

        if (queryparams.page && queryparams.limit) {
          let page = parseInt(queryparams.page);
          let limit = parseInt(queryparams.limit);
          let start = (page - 1) * limit;
          let end = page * limit;
          let next = "";
          let prev = "";
          const dataNext = Math.ceil(result.rowCount / limit);
          if (start <= result.rowCount) {
            next = page + 1;
          }
          if (end > 0) {
            prev = page - 1;
          }
          if (parseInt(next) <= parseInt(dataNext)) {
            resNext = `${link}page=${next}&limit=${limit}`;
          }
          if (parseInt(prev) !== 0) {
            resPrev = `${link}page=${prev}&limit=${limit}`;
          }
          let sendResponse = {
            dataCount: result.rowCount,
            next: resNext,
            prev: resPrev,
            totalPage: Math.ceil(result.rowCount / limit),
            data: queryresult.rows,
          };
          // console.log(result);
          return resolve(sendResponse);
        }

        let sendResponse = {
          dataCount: result.rowCount,
          next: resNext,
          prev: resPrev,
          totalPage: null,
          data: queryresult,
        };

        return resolve(sendResponse);
      });
      return resolve(result);
    });
  });
};

const createTransactions = (body, token) => {
  return new Promise((resolve, reject) => {
    const query =
      "insert into transactions (user_id, product_id, promo_id, delivery_id, method_payment, qty, tax, total, status) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning product_id";
    const {
      product_id,
      promo_id,
      delivery_id,
      method_payment,
      qty,
      tax,
      total,
      status,
    } = body;
    postgreDb.query(
      query,
      [
        token,
        product_id,
        promo_id,
        delivery_id,
        method_payment,
        qty,
        tax,
        total,
        status,
      ],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(queryResult);
        /*
        const getQuery = "select * from products where id = $1";
        postgreDb.query(
          getQuery,
          [queryResult.rows[0].product_id],
          (err, result) => {
            if (err) {
              console.log(err);
              return reject(err);
            }
            resolve(result.rows[0]);
          }
        );*/
      }
    );
  });
};

const editTransactions = (body, params) => {
  return new Promise((resolve, reject) => {
    let query = "update transactions set ";
    const values = [];
    // menggunakan perulangan untuk dapat melakukan pengubahan semua data pada table product
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1} where id = $${idx + 2}`;
        values.push(body[key], params.id);
        return;
      }
      query += `${key} = $${idx + 1},`;
      values.push(body[key]);
    });
    postgreDb
      .query(query, values)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

const dropTransactions = (params) => {
  return new Promise((resolve, reject) => {
    const query = "delete from transactions where id = $1";
    postgreDb.query(query, [params.id], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const getByStatus = () => {
  return new Promise((resolve, reject) => {
    const query =
      "select transactions.id,profile.displayname, transactions.qty,transactions.total,product.name,product.image,transactions.status from transactions inner join users on transactions.user_id = users.id inner join profile on users.id = profile.users_id inner join product on transactions.product_id = product.id where transactions.status = 'paid' or transactions.status ='pending' order by transactions.create_at DESC";
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const statusApprove = (status, id) => {
  return new Promise((resolve, reject) => {
    const query = "update transactions set status = $1 where id = $2";
    postgreDb.query(query, [status, id], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const transactionsRepo = {
  getALL,
  historyTransactions,
  createTransactions,
  editTransactions,
  dropTransactions,
  statusApprove,
  getByStatus,
};

module.exports = transactionsRepo;
