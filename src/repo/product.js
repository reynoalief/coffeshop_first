const postgresDb = require("../config/postgre");
const filterCategory = (queryParams) => {
  return new Promise((resolve, reject) => {
    let query =
      "select pr.*,p.code,p.valid,p.discount from products pr full join promos p on pr.id = p.product_id ";
    // page
    const values = [];
    const whereParams = ["category"];
    if (whereParams.length > 0) query += "where ";
    whereParams.forEach((key) => {
      query += ` lower(${key}) ilike ($${values.length + 1})`;
      values.push(String(queryParams[key]));
    });
    values.forEach((value) => console.log(typeof value));
    // limit & offset untuk pagination
    const page = Number(queryParams.page);
    const limit = Number(queryParams.limit);
    const offset = (page - 1) * limit;
    query += `limit $${values.length + 1} offset $${values.length + 2}`;
    values.push(limit, offset);
    postgresDb.query(query, values, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }

      return resolve(result);
    });
  });
};

const getAll = (queryParams, hostAPI) => {
  return new Promise((resolve, reject) => {
    let query =
      "select pr.*,p.code,p.valid,p.discount from products pr full join promos p on pr.id = p.product_id ";

    let queryLimit = "";
    let link = `${hostAPI}/api/product/?`;
    // page
    if (queryParams.search) {
      query += `where lower(name) ilike ('%${queryParams.search}%')`;
      link += `name=${queryParams.search}&`;
    }

    if (queryParams.category) {
      if (queryParams.search) {
        query += ` and lower(category) ilike ('${queryParams.category}%')`;
        link += `category=${queryParams.category}%&`;
      } else {
        query += ` where lower(category) ilike ('${queryParams.category}%')`;
        link += `category=${queryParams.category}%&`;
      }
    }

    if (queryParams["sort"] == "cheapest") {
      query += "order by pr.price asc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams["sort"] == "expensive") {
      query += "order by pr.price desc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams["sort"] == "newest") {
      query += "order by create_at asc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams["sort"] == "lastest") {
      query += "order by create_at desc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams["sort"] == "id_asc") {
      query += "order by id asc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams["sort"] == "id_desc") {
      query += "order by id desc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams["sort"] == "favorite") {
      query =
        // " select pr.*,p.code,p.valid,p.discount,tr.qty from products pr left join promos p on pr.id = p.product_id left join transactions tr on pr.id = tr.product_id order by tr.qty desc";
        " select pr.*,p.code,p.valid,p.discount,COALESCE(sum(tr.qty),0) as sold from products pr left join promos p on pr.id = p.product_id left join transactions tr on pr.id = tr.product_id GROUP BY pr.id,p.code,p.valid,p.discount ORDER by sold desc";
      link += `sort=${queryParams.sort}&`;
    }

    // let page = Number(queryParams.page);
    // let limit = Number(queryParams.limit);
    // let offset = (page - 1) * limit;
    // query += ` limit ${limit} offset ${offset}`;

    let values = [];
    if (queryParams.page && queryParams.limit) {
      let page = parseInt(queryParams.page);
      let limit = parseInt(queryParams.limit);
      let offset = (page - 1) * limit;
      queryLimit = query + ` limit $1 offset $2`;
      values.push(limit, offset);
    } else {
      queryLimit = query;
    }

    // page
    // postgresDb.query(query, (err, result) => {
    //     if (err) {
    //         console.log(err);
    //         return reject(err);
    //     }
    //     return resolve(result);
    // });
    postgresDb.query(query, (err, result) => {
      postgresDb.query(queryLimit, values, (err, queryresult) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        // console.log(queryresult);
        // console.log(queryLimit);
        if (queryresult.rows.length == 0)
          return reject(new Error("Product Not Found"));
        let resNext = null;
        let resPrev = null;
        if (queryParams.page && queryParams.limit) {
          let page = parseInt(queryParams.page);
          let limit = parseInt(queryParams.limit);
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

          return resolve(sendResponse);
        }
        let sendResponse = {
          dataCount: result.rowCount,
          next: resNext,
          prev: resPrev,
          totalPage: null,
          data: queryresult.rows,
        };

        return resolve(sendResponse);
      });
    });
  });
};

const create = (body, file) => {
  return new Promise((resolve, reject) => {
    const { name, category, size, price, stock, description } = body;
    // const { image } = file;
    const query =
      "insert into products (name, category, size, price, stock, image, description) values ($1,$2,$3,$4,$5,$6,$7) returning *";
    postgresDb.query(
      query,
      [name, category, size, price, stock, file, description],
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
    let query = "update products set ";
    const values = [];
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1} where id = $${idx + 2} returning *`;

        values.push(body[key], params.id);
        return;
      }
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
    const query = "delete from products where id = $1 returning id";
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
    const query = "select * from products where id = $1";
    postgresDb.query(query, [params.id], (err, queryResult) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(queryResult);
    });
  });
};

const productRepo = {
  getAll,
  filterCategory,
  create,
  edit,
  deleted,
  getId,
};
module.exports = productRepo;
