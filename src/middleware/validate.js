module.exports = {
  body: (...allowedKeys) => {
    return (req, res, next) => {
      const { body } = req;
      const sanitizedKey = Object.keys(body).filter((key) =>
        allowedKeys.includes(key)
      );
      const newBody = {};
      for (let key of sanitizedKey) {
        Object.assign(newBody, { [key]: body[key] });
      }
      // apakah jumlah key di body sesuai dengan jumlah di allowedKeys
      if (Object.keys(newBody).length === 0)
        return res.status(400).json({ msg: "Nothing insert" });
      // apakah setiap value sesuai dengan tipe data yang diinginkan
      if (Object.keys(newBody).length !== allowedKeys.length)
        return res.status(400).json({ msg: "input does not match key" });
      req.body = newBody;
      next();
    };
  },
  // validasi params
  params: (...allowedKeys) => {
    return (req, res, next) => {
      const { params } = req;
      const sanitizedKey = Object.keys(params).filter((key) =>
        allowedKeys.includes(key)
      );
      const newParams = {};
      for (let key of sanitizedKey) {
        Object.assign(newParams, { [key]: params[key] });
      }
      req.params = newParams;
      next();
    };
  },
  // validasi image
  img: () => {
    return (req, res, next) => {
      let { file } = req;
      if (!file) {
        file = null;
      }
      next();
    };
  },

  // validasi email and phone number
  email: (...allowedKeys) => {
    return (req, res, next) => {
      const { body } = req;
      const sanitizedKey = Object.keys(body).filter((key) =>
        allowedKeys.includes(key)
      );
      const newBody = {};
      for (let key of sanitizedKey) {
        if (key == "phone") {
          let regexPhone =
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
          if (!regexPhone.test(body[key])) {
            return res.status(400).json({
              msg: "wrong input number phone",
              data: null,
            });
          }
        }

        Object.assign(newBody, { [key]: body[key] });
      }
      req.body = newBody;
      next();
    };
  },
};
