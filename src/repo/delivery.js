const postgresDb = require("../config/postgre");

const get = () => {
  return new Promise((resolve, reject) => {
    const query = "select * from delivery order by id asc";
    postgresDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const create = (body) => {
  return new Promise((resolve, reject) => {
    const { method, shipping } = body;
    const query =
      "insert into delivery (method,shipping) values ($1,$2) returning *";
    postgresDb.query(query, [method, shipping], (err, queryResult) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(queryResult);
    });
  });
};

const edit = (body, params) => {
  return new Promise((resolve, reject) => {
    let query = "update delivery set ";
    const values = [];
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1} where id = $${idx + 2} returning *`;

        values.push(body[key], params.id);
        return;
      }
      console.log([idx]);

      query += `${key} = $${idx + 1},`;
      values.push(body[key]);
    });
    postgresDb
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

const deleted = (params) => {
  return new Promise((resolve, reject) => {
    const query = "delete from delivery where id = $1 returning id";
    postgresDb.query(query, [params.id], (err, queryResult) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(queryResult);
    });
  });
};

const deliveryRepo = {
  get,
  create,
  edit,
  deleted,
};
module.exports = deliveryRepo;
