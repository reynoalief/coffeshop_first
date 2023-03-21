const postgresDb = require("../config/postgre");
const bcrypt = require("bcrypt"); //import hash
const get = () => {
  return new Promise((resolve, reject) => {
    let query = `select * from users order by id asc`;
    // paginasi biasanya diwakili dengan query dan limit
    postgresDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const getId = (token) => {
  return new Promise((resolve, reject) => {
    const query = `select * from users where id = $1`;
    postgresDb.query(query, [token], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const register = (body) => {
  return new Promise((resolve, reject) => {
    let query = `insert into users (email, password, phone_number) values ($1, $2, $3) returning id, email`;
    const { email, password, phone_number } = body;
    // Hash Password
    postgresDb.query(
      "select email from users where email = $1",
      [email],
      (err, resEmail) => {
        if (resEmail.rows.length > 0) {
          return reject("Email already exist!");
        }
        postgresDb.query(
          "select phone_number from users where phone_number = $1",
          [phone_number],
          (err, resPhone) => {
            if (resPhone.rows.length > 0) {
              return reject("Phone Number already exist!");
            }
            bcrypt.hash(password, 10, (err, hashedPasswords) => {
              if (err) {
                console.log(err);
                return reject(err);
              }
              postgresDb.query(
                query,
                [email, hashedPasswords, phone_number],
                (err, response) => {
                  if (err) {
                    console.log(err);
                    return reject(err);
                  }
                  let getIDUsers = response.rows[0].id;
                  let load = {
                    email: response.rows[0].email,
                  };
                  let addIdToProfile = `insert into profiles (user_id) values (${getIDUsers})`;
                  console.log(addIdToProfile);
                  postgresDb.query(addIdToProfile, (err, queryResult) => {
                    if (err) {
                      return reject({ err });
                    }
                    resolve({
                      data: load.email,
                      queryResult,
                    });
                  });
                }
              );
            });
          }
        );
      }
    );
  });
};
const editPassword = (body, token) => {
  return new Promise((resolve, reject) => {
    const { old_password, new_password } = body;
    const getPwdQuery = "select password from users where id = $1";
    const getPwdValues = [token];
    postgresDb.query(getPwdQuery, getPwdValues, (err, response) => {
      if (err) {
        console.log(err);
        return reject({ err });
      }
      const hashedPassword = response.rows[0].password;
      bcrypt.compare(old_password, hashedPassword, (err, isSame) => {
        if (err) {
          console.log(err);
          return reject({ err });
        }
        if (!isSame)
          return reject({
            err: new Error("Old Password is Wrong!"),
            statusCode: 403,
          });
        bcrypt.hash(new_password, 10, (err, newHashedPassword) => {
          if (err) {
            console.log(err);
            return reject({ err });
          }
          const editPwdQuery = "update users set password = $1 where id = $2";
          const editPwdValues = [newHashedPassword, token];
          postgresDb.query(editPwdQuery, editPwdValues, (err, response) => {
            if (err) {
              console.log(err);
              return reject({ err });
            }
            return resolve(response);
          });
        });
      });
    });
  });
};

// karena foreign key dengan users maka dihapus user_id di bagian profiles baru hapus di users.id ya
const deleted = (params) => {
  return new Promise((resolve, reject) => {
    let query = `delete from profiles where user_id = $1 returning user_id`;
    postgresDb.query(query, [params.user_id], (err, res) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      let deleteToUserId = `delete from users where id = (${params.user_id}) returning id`;
      console.log(deleteToUserId);
      postgresDb.query(deleteToUserId, (err, result) => {
        if (err) {
          return reject({ err });
        }
        resolve(result);
      });
    });
  });
};
const userRepo = {
  get,
  getId,
  register,
  editPassword,
  deleted,
};
module.exports = userRepo;
