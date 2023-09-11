# LOGIN y Hash de password

El presente proyecto esta basado en el proyecto de DH realizado por Javi Herrera.

## guardar la password en un hash

1.  Instalacion de libreria bcryptjs

    `npm install bcryptjs`

2.  Uso de la libreria bcryptjs

La libreria bcryptjs tiene dos metodos que vamos a utilizar:
_bcrypt.hashSync:_ que hashea una contraseña, para lo cual tenemos que pasarle la contraseña y un numero que indicará la "salt" o el grado de aleatoriedad que tendra esa conversion.

Luego la propiedad bcrypt.compareSync se encargará de comprar una contraseña, con la hasheada. Para comparar debemos poner como primer parametro la contraseña, y luego el hash

    ```js
    const bcryptjs = require("bcryptjs");

    let hash = bcryptjs.hashSync("12345678", 10);
    console.log(hash);
    // me generara algo de este tipo: $2a$10$UQpOUAsHtu09WnzWcwyPiOKltR6447fSTyCmuBsToh9egXf1D4.nm
    console.log(bcryptjs.compareSync("12345678", hash));
    // nos dará true
    console.log(bcryptjs.compareSync("1234567", hash));
    // nos dará false
    ```

3. Para guardar en la creacion de un usuario:
   Antes de guardar el usuario, lo que haremos será hashear la password:

   ```js
   const newUser = {
     ...req.body,
     password: bcryptjs.hashSync(req.body.password),
     avatar: req.file.filename,
   };
   ```

4. Proceso de registracion de un usuario:

```js
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
      return res.redirect("/");
    }
  },
```

5. Proceso de Login:

Para el proceso de login vamos primero a chequear que el usuario exista y luego utilizando la libreria bcrypt, con el metodo compareSync compararemos las contraseñas, ambos coinciden se redireccionará a un perfil de usuario. Sino se mostraran los errores

```js
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
```

## Uso de Session

1. Primero debemos instalar la libreria:

   `npm i express-session`

2. Tengo que inicializar session en app.js y pasarlo como un middleware global:

```js
const session = require("express-session");
// aqui hay codigo
app.use(
  session({
    secret: "Hi, i have a secret",
    resave: false,
    saveUninitialized: false,
  })
);
```

> Ahora cada vez que en una funcion con (req, res) vamos a tener una propiedad req.session donde vamos a poder guardar cosas.
> si hago un console.log(req.session) me dara algo como esto:
> Session {
> cookie: {path:"/",.....}
> }

2. Para guardar la sesion del usuario logueado:
   Voy al metodo donde hice el login y guardo los datos del usuario logueado en una propiedad de session:

```js
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
        // aca uso session para guardar mi usuario logueado:---------------------------------
        delete userToLogin.password; // borro del usuario la password por seguridad
        req.session.userLogged = userToLogin;

        return res.redirect("/user/profile");
      } ...
```

    Ahora para ver mi usuario logueado puedo pasarle los datos del login a la vista:

```js
    profile: (req, res) => {
        return res.render("userProfile", {
        user: req.session.userLogged,
        });
    },
```

y cambio en la vista las variables para poder ver el usuario logueado

3.  Establecer rutas protegidas
    Para ello hago middleware de rutas:

        Para las rutas de guest:

    ```js
    const guestMiddleware = (req, res, next) => {
      if (req.session.userLogged) {
        return res.redirect("/user/profile");
      }
      next();
    };
    ```

    Y aplico como middleware en las rutas que no deberia acceder un usuario logueado como login o register:

    ```js
    router.get("/register", guestMiddleware, usersController.register);
    router.get("/login", guestMiddleware, usersController.login);
    ```

    Para las rutas de usuario Autenticado:

    ```js
    const authMiddleware = (req, res, next) => {
      if (!req.session.userLogged) {
        return res.redirect("/user/login");
      }
      next();
    };
    ```

    Y aplico a las rutas donde un usuario no logueado no podria acceder:

    ```js
    router.get("/profile", authMiddleware, usersController.profile);
    ```

4.  Crear un middleware de aplicacion para poder pasar variables a las vistas:

    Para poder pasar variables a las vistas, voy a tener que guardar el nombre de usuario en una variable local.
    Para ello creo un middleware de aplicacion para guardar dentro de las variables:
    res.locals.isLogged = true si esta logueado
    res.locals.userLogged = el usuario para poder acceder desde las vistas.

    ```js
    const userLoggedMiddleware = (req, res, next) => {
      res.locals.isLogged = false;
      if (req.session.userLogged) {
        res.locals.isLogged = true;
        res.locals.userLogged = req.session.userLogged;
      }
      next();
    };
    ```

    en las vistas:

    ```html
    <img
      src="/images/avatars/<%=locals.userLogged?locals.userLogged.avatar:'default.png'%>"
      width="40"
      style="border-radius: 100%"
    />
    Hi <%= locals.userLogged ?locals.userLogged.fullName:"User" %>
    ```

## Recordar el usuario con cookies

1. Instalar cookie-parser

   `npm i cookie-parser`

2. Voy a agregar como un middleware de la aplicación.

En app.js voy a requerir el modulo y luego voy a invocarlo como un middleware.

```js
const cookies = require("cooke-parser");

app.use(cookies());
```

Una cookie es información que se va a guardar del lado del navegador.

Ejemplo:
SETEAR UNA COOKIE: Cuando voy a setear una cookie, tengo que setearla utilizando la propiedad de **res**. En el caso siguiente estoy seteando la cookie llamada "testing", que tiene el valor "hola mundo!" y que dura 3 segundos.

 ```js
    res.cookie("testing", "Hola mundo!", { maxAge: 1000 * 30 });
 ```

LEER UNA COOKIE: Mientras que cuando voy a leerla tengo que buscar el objeto cookies que me llega desde **req**. Y cuando voy a leerlas es cookies (varias), mientras al setearla es cookie (una sola)

```js
console.log(req.cookies.testing);
```

3.  Implementación: Setear la cookie:
    En el proyecto, si quiero recordar el usuario, o sea que cuando se cierre el navegador y se vuelva a abrir no se pierda el login, para ello tengo que hacer algunos pasos extras:

    Primero, chequeo que efectivamente este clickeado el check remember_user del formulario de login. Si esta checkeado, me llegará en el body junto con los otros datos un dato llamado remember_user. Si este dato llega, entonces voy a setear una cookie:

    En mi caso hago esto en el metodo loginProcess:

    ```js
    loginProcess: (req, res) => {
     let userToLogin = User.findByField("email", req.body.email);
     if (userToLogin) {
       let okPassword = bcryptjs.compareSync(
         req.body.password,
         userToLogin.password
       );
       if (okPassword) {
         delete userToLogin.password;
         req.session.userLogged = userToLogin;
         if (req.body.remember_user) {
           // -------------------------------------------- aqui
           // seteo la cookie
           res.cookie("userEmail", req.body.email, { maxAge: 1000 * 60 * 2 }); // seteo 2 minutos
         }
         return res.redirect("/user/profile");
       }
    ```

4.  Cambiar el middleware para que mantenga la sesión:
    En el middleware donde se guarda el logueo del usuario:

    1. Primero voy a traer el modelo User.
    2. voy a preguntar si existe la cookie
    3. Si existe voy a buscar el usuario utilizando el metodo "User.findByField"
    4. Si encuentro el usuario, voy a guardar el usuario dentro de la session.

    ```js
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
    ```

    De esta forma cuando dentro del middleware chequee si userLogged esta dentro de session, el mismo va a estar dentro de session.

5.  Destruccion de la cookie:
    La cookie va a vivir el tiempo que le especifiquemos.. pero si queremos desloguearnos, no vamos a poder hacer esto. Para ello en el proceso de logout, debemos destruir la cookie:

    ```js
        logout: (req, res) => {
            // para borrar la cookie
            res.clearCookie("userEmail");
            req.session.destroy();
            res.redirect("/");
        },
   ```

    De esta manera ya podremos desloguearnos.
