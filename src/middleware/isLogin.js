const jwt = require("jsonwebtoken");
/*
var JWTR = require("jwt-redis").default;
const client = require("../config/redis");
const jwtr = new JWTR(client);
*/

module.exports = () => {
  return (req, res, next) => {
    const token = req.header("x-access-token");
    if (!token)
      return res
        .status(401)
        .json({ msg: "You have to login first", data: null });
    // Verifikasi dengan redis
    /*
        jwtr.verify(token, process.env.SECRET_KEY, {
            issuer: process.env.ISSUER,
        })
            .then((decodedPayload) => {
                req.userPayload = decodedPayload;
                next();
            })
            .catch((err) => {
                return res
                    .status(401)
                    .json({ msg: "You have to login first", data: null });
            });
        */
    // Verifikasi tanpa redis
    jwt.verify(token, process.env.SECRET_KEY, (err, decodedPayload) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: err.message,
          data: null,
        });
      }
      // Payload akan di tempel ke object request
      req.userPayload = decodedPayload;
      next();
    });
  };
};
