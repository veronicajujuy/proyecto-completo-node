const express = require("express");
const router = express.Router();

// configuracion de multer
const uploadFile = require("../middlewares/multerMiddleware");
// configuracion de express-validator
const validations = require("../middlewares/validatorMiddleware");

const usersController = require("../controllers/userController");
const guestMiddleware = require("../middlewares/guestMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

// Formulario de registro
router.get("/register", guestMiddleware, usersController.register);

// Procesar el registro
router.post(
  "/register",
  uploadFile.single("avatar"),
  validations,
  usersController.processRegister
);

// Formulario de login
router.get("/login", guestMiddleware, usersController.login);
router.post("/login", usersController.loginProcess);

// Perfil de Usuario
router.get("/profile", authMiddleware, usersController.profile);

router.get("/logout", usersController.logout);

module.exports = router;
