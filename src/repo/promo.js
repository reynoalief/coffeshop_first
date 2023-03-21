const postgresDb = require("../config/postgre");
const get = () => {
  return new Promise((resolve, reject) => {
    const query =
      "select p.id,p.product_id,pr.name,p.* from promos p inner join products pr on p.product_id = pr.id ";
    postgresDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const searchPromo = (queryparams) => {
  return new Promise((resolve, reject) => {
    const query =
      "select promos.id, promos.product_id, products.name, promos.* from promos inner join products on products.id = promos.product_id where lower(code) LIKE lower($1)";
    const { code } = queryparams;
    postgresDb.query(query, [`%${code}%`], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const create = (body, file) => {
  return new Promise((resolve, reject) => {
    const { product_id, code, discount, valid, color } = body;
    const query =
      "insert into promos (product_id, code, discount, valid,color,image) values ($1,upper($2),$3,$4,$5,$6) returning *";
    postgresDb.query(
      query,
      [product_id, code, discount, valid, color, file],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(queryResult);
      }
    );
  });
};

const edit = (body, params) => {
  return new Promise((resolve, reject) => {
    let query = "update promos set ";
    const values = [];
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1} where id = $${idx + 2} returning *`;

        values.push(body[key], params.id);
        return;
      }
      console.log([idx]);

      query += `${key} = $${idx + 1},`;
      values.push(body[key].toUpperCase());
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
    const query = "delete from promos where id = $1 returning id";
    postgresDb.query(query, [params.id], (err, queryResult) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(queryResult);
    });
  });
};

const getId = (params) => {
  return new Promise((resolve, reject) => {
    const query =
      "select promos.*, products.* from promos inner join products on promos.product_id = products.id where promos.id = $1";
    postgresDb.query(query, [params.id], (err, queryResult) => {
      if (err) {
        return reject(err);
      } else if (queryResult.rows.length == 0) {
        return reject(`data tidak ada`);
      }
      return resolve(queryResult);
    });
  });
};
const promoRepo = {
  get,
  getId,
  create,
  searchPromo,
  edit,
  deleted,
};
module.exports = promoRepo;
