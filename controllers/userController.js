const { validationResult } = require("express-validator");
const User = require("../models/User");

const controller = {
  register: (req, res) => {
    return res.render("userRegisterForm");
  },
  processRegister: (req, res) => {
    const resultValidation = validationResult(req);

    if (resultValidation.errors.length > 0) {
      return res.render("userRegisterForm", {
        errors: resultValidation.mapped(),
        oldData: req.body,
      });
    }
    const newUser = {
      ...req.body,
      avatar: req.file.filename,
    };
    User.create(newUser);
    return res.send("Ok, se guardo el usuario");
  },
  login: (req, res) => {
    return res.render("userLoginForm");
  },
  profile: (req, res) => {
    return res.render("userProfile");
  },
};

module.exports = controller;
