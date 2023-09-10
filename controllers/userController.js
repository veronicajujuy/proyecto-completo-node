const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
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
    let checkUser = User.findByField("email", req.body.email);
    if (checkUser) {
      return res.render("userRegisterForm", {
        errors: {
          email: {
            msg: "Este mail ya se encuentra registrado",
          },
        },
        oldData: req.body,
      });
    } else {
      const newUser = {
        ...req.body,
        password: bcryptjs.hashSync(req.body.password),
        avatar: req.file.filename,
      };
      let userCreated = User.create(newUser);
      return res.redirect("/login");
    }
  },
  login: (req, res) => {
    return res.render("userLoginForm");
  },
  loginProcess: (req, res) => {
    // primero vamos a chequear que el usuario exista:
    let userToLogin = User.findByField("email", req.body.email);
    if (userToLogin) {
      // si el usuario existe tengo que chequear la password:
      // para ello uso la funcion compareSync:
      let okPassword = bcryptjs.compareSync(
        req.body.password,
        userToLogin.password
      );
      if (okPassword) {
        // aca uso session para guardar mi usuario logueado:
        delete userToLogin.password; // borro del usuario la password por seguridad
        req.session.userLogged = userToLogin;
        if (req.body.remember_user) {
          // seteo la cookie
          res.cookie("userEmail", req.body.email, { maxAge: 1000 * 60 * 2 }); // seteo 2 minutos
        }
        return res.redirect("/user/profile");
      } else {
        return res.render("userLoginForm", {
          errors: {
            email: {
              msg: "Las credenciales son invalidas",
            },
          },
        });
      }
    } else {
      return res.render("userLoginForm", {
        errors: {
          email: {
            msg: "No se encontro el email",
          },
        },
      });
    }
  },
  profile: (req, res) => {
    console.log(req.cookies);
    return res.render("userProfile", {
      user: req.session.userLogged,
    });
  },
  logout: (req, res) => {
    res.clearCookie("userEmail");
    req.session.destroy();
    res.redirect("/");
  },
};

module.exports = controller;
