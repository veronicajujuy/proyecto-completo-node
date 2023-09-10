const express = require("express");
const session = require("express-session");
const userLoggedMiddleware = require("./middlewares/userLoggedMiddleware");
const cookies = require("cookie-parser");

const app = express();

app.use(
  session({
    secret: "Hi, i have a secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookies());
// este middleware va siempre luego de la session:
app.use(userLoggedMiddleware);
app.use(express.urlencoded({ extended: false }));

app.use(express.static("./public"));
app.listen(3000, () => console.log("Servidor levantado en el puerto 3000"));

// Template Engine
app.set("view engine", "ejs");

// Routers
const mainRoutes = require("./routes/mainRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/", mainRoutes);
app.use("/user", userRoutes);
