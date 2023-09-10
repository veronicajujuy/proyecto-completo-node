const User = require("../models/User");
const userLoggedMiddleware = (req, res, next) => {
  res.locals.isLogged = false;
  if (req.cookies.userEmail) {
    const userFromCookie = User.findByField("email", req.cookies.userEmail);

    if (userFromCookie) {
      req.session.userLogged = userFromCookie;
    }
  }

  if (req.session.userLogged) {
    res.locals.isLogged = true;
    res.locals.userLogged = req.session.userLogged;
  }

  next();
};

module.exports = userLoggedMiddleware;
