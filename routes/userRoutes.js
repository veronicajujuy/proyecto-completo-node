const express = require("express");
const router = express.Router();

// configuracion de multer
const uploadFile = require("../middlewares/multerMiddleware");
// configuracion de express-validator
const validations = require("../middlewares/validatorMiddleware");

const usersController = require("../controllers/userController");

// Formulario de registro
router.get("/register", usersController.register);

// Procesar el registro
router.post(
  "/register",
  uploadFile.single("avatar"),
  validations,
  usersController.processRegister
);

// Formulario de login
router.get("/login", usersController.login);

// Perfil de Usuario
router.get("/profile/:userId", usersController.profile);

module.exports = router;
