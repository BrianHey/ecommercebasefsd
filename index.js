const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const axios = require("axios");
const Handlebars = require("handlebars");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const optionsForm = require("./optionsForm");
const { v4: uuidv4 } = require("uuid");
const firebase = require("firebase");
const jwt = require("jsonwebtoken");
require("dotenv").config();

var firebaseConfig = {
  apiKey: "AIzaSyDmLEpV8JvRs90TDwXkqcZuBE0L56HiouQ",
  authDomain: "clase05-10.firebaseapp.com",
  databaseURL: "https://clase05-10.firebaseio.com",
  projectId: "clase05-10",
  storageBucket: "clase05-10.appspot.com",
  messagingSenderId: "896690830399",
  appId: "1:896690830399:web:d16b052ed3db66656acc8a",
};

firebase.initializeApp(firebaseConfig);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  fileUpload({
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: "Supero el límte",
    helpers: {},
  })
);

const {
  getCategories,
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  adminLogin,
  addTransaction,
} = require("./consultas.js");

app.listen(3000);

app.use("/css", express.static(__dirname + "/assets/css"));
app.use("/js", express.static(__dirname + "/assets/js"));
app.use("/assets", express.static(__dirname + "/assets"));

app.set("view engine", "handlebars");
app.engine(
  "handlebars",
  exphbs({
    layoutsDir: __dirname + "/views",
    partialsDir: __dirname + "/views/components/",
    defaultLayout: __dirname + "/views/layouts/main",
  })
);

Handlebars.registerHelper("formatDate", (fecha) => {
  let año = fecha.getFullYear();
  let mes = fecha.getMonth() + 1;
  let dia = fecha.getDate();
  let hora = fecha.getHours();
  let minutos = fecha.getMinutes();
  return `${dia}/${mes}/${año}`;
});

Handlebars.registerHelper("ifCond", function (v1, v2, options) {
  console.log(v1, v2);
  if (v1 === v2) {
    return options.fn(this);
  }
});

app.get("/admin/productos", (req, res) => {
  const { token } = req.query;

  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if (!err) {
      const promiseOptions = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      const [productos, categories] = promiseOptions;
      const { sizes, colors, genders } = optionsForm;
      productos.forEach((p) => {
        p.category = categories.find((c) => c.id == p.category).name;
      });

      res.render("Productos", {
        products: JSON.stringify(productos),
        productos,
        sizesData: JSON.stringify(sizes),
        sizes,
        colorsData: JSON.stringify(colors),
        colors,
        gendersData: JSON.stringify(genders),
        genders,
        categoriesData: JSON.stringify(categories),
        categories,
      });
    } else {
      res.status(401).redirect("/");
    }
  });
});

app.post("/productos", async (req, res) => {
  let productos = req.body;

  try {
    productos = Object.values(productos);
    const result = await addProduct(productos);
    res.status(201).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "500 Internal Error", message: e.message });
  }
});

app.put("/productos/:id", async (req, res) => {
  const { id } = req.params;
  let productos = req.body;
  productos.id = id;
  try {
    productos = Object.values(productos);
    const result = await updateProduct(productos);
    res.status(201).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "500 Internal Error", message: e.message });
  }
});

app.post("/files", (req, res) => {
  const { image } = req.files;
  console.log(image);
  const format = image.mimetype.split("/")[1];
  const path = `assets/images/${uuidv4().slice(30)}.${format}`;
  image.mv(path, (err) => {
    err ? res.status(500).send("Something wrong...") : res.send(path);
  });
});

app.get("/productos", async (req, res) => {
  try {
    const respuesta = await getProducts();
    res.send(respuesta);
  } catch (err) {
    res.status(500).send({ message: err.message, error: "Error 500." });
  }
});

app.delete("/productos/:id", async (req, res) => {
  const { id } = req.params;

  const respuesta = await deleteProduct(id);
  respuesta > 0
    ? res.send({ status: "200", message: "Producto Eliminado" })
    : res.status(500).send({
        message: "No existe un registro con el id indicado",
        error: "Error 500.",
      });
});

app.get("/", async (req, res) => {
  const { pag } = req.query;

  let productos = await getProducts();
  const pageQ = Math.ceil(productos.length / 8);

  pag
    ? (productos = productos.slice(pag * 8 - 8, pag * 8))
    : (productos = productos.slice(0, 8));
  res.render("Inicio", {
    productos,
    pageQ,
    pag,
  });
});

app.get("/producto/:id", async (req, res) => {
  const { id } = req.params;
  const promiseOptions = await Promise.all([getProducts(), getCategories()]);
  const [productos, categories] = promiseOptions;
  productos.forEach((p) => {
    p.category = categories.find((c) => c.id == p.category).name;
  });
  let producto = productos.find((p) => p.id == id);
  res.render("Details", { producto, productoData: JSON.stringify(producto) });
});

// app.get("/busqueda/:input", async (req, res) => {
//   let productos = await getProducts();
//   const { input } = req.params;
//   let all_ProductsLabels = productos.map((p) => p.model);
//   all_ProductsLabels = [...new Set(all_ProductsLabels)];
//   productos = productos.filter((p) =>
//     input.toLowerCase().includes(p.model.toLowerCase())
//   );

//   let filtros = Object.keys(productos[0]);

//   res.render("Busqueda", {
//     productos,
//     all_ProductsLabels,
//     filtros,
//   });
// });

app.get("/busqueda/:filtro/:input", async (req, res) => {
  let productos = await getProducts();
  let filtros = Object.keys(productos[0]);

  const { filtro, input } = req.params;
  let all_ProductsLabels = productos.map((p) => p.model);
  all_ProductsLabels = [...new Set(all_ProductsLabels)];

  if (filtro == "todos") {
    productos = productos.filter((p) => {
      let valoresDeBusqueda = Object.values(p).map((v) =>
        v.toString().toLocaleLowerCase()
      );
      return valoresDeBusqueda.includes(input.toLocaleLowerCase());
    });
  } else {
    productos = productos.filter((p) => {
      return p[filtro].toString().toLowerCase().includes(input.toLowerCase());
    });
  }

  res.render("Busqueda", {
    productos: productos.length >= 1 ? productos : null,
    all_ProductsLabels,
    filtros,
  });
});

app.get("/carrito", (req, res) => {
  res.render("Carrito");
});

app.get("/registro", (req, res) => {
  res.render("Registro");
});

app.post("/registro", (req, res) => {
  const { email, nombre, password } = req.body;

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(async (resultado) => {
      const uid = resultado.user.uid;

      console.log(uid);
      await firebase
        .firestore()
        .collection("users")
        .add({ email, nombre, password })
        .catch((e) => console.log(e));
      res.send(resultado.user);
    })
    .catch((e) => {
      res.status(500).send(e);
    });
});

app.get("/login", (req, res) => {
  res.render("Login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      firebase
        .firestore()
        .collection("users")
        .where("email", "==", email)
        .get()
        .then((snapshot) => {
          const user = [];
          snapshot.forEach((doc) => {
            user.push({ id: doc.id, data: doc.data() });
          });

          res.send(user[0]);
        });
    })
    .catch((e) => {
      res.status(500).send(e);
    });
});

app.post("/admin", async (req, res) => {
  const { username, password } = req.body;

  console.log(username);
  console.log(password);
  try {
    const resultado = await adminLogin([username, password]);
    jwt.sign(
      {
        data: resultado,
        exp: Math.floor(Date.now() / 1000) + 60,
      },
      process.env.SECRET_KEY,
      (err, jwt) => {
        console.log(jwt);
        res.send(jwt);
      }
    );
  } catch (e) {
    res.status(500).send({ error: "500 internal error", message: e.message });
  }
});

app.get("/admin", (req, res) => {
  res.render("Admin");
});

app.post("/transaction", async (req, res) => {
  const { amount } = req.body;
  console.log(amount);
  await axios({
    url:
      "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.0/transactions",
    headers: {
      "Content-type": "application/json",
      "Tbk-Api-Key-Id": "597055555532",
      "Tbk-Api-Key-Secret":
        "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
    },
    data: {
      buy_order: "ordenCompra12345678",
      session_id: "sesion1234557545",
      amount,
      return_url: "http://localhost:3000/success",
    },
    method: "POST",
  }).then((data) => {
    const { token } = data.data;
    console.log(token);
    res.send({ token });
  });
});

app.post("/success", (req, res) => {
  const { token_ws: token } = req.body;
  axios({
    url:
      "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.0/transactions/" +
      token,
    headers: {
      "Content-type": "application/json",
      "Tbk-Api-Key-Id": "597055555532",
      "Tbk-Api-Key-Secret":
        "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
    },
    method: "PUT",
  }).then(async (data) => {
    const details = data.data;
    if (data.data.status !== "AUTHORIZED") {
      res.send("Algo salió mal en la compra...");
    } else {
      try {
        let {
          buy_order: order_number,
          transaction_date: date,
          amount,
          card_detail,
          payment_type_code: payment_type,
        } = details;
        card_detail = card_detail.card_number;
        const trasnactionValues = [
          order_number,
          date,
          amount,
          card_detail,
          payment_type,
        ];

        await addTransaction(trasnactionValues);
        res.redirect(`http://localhost:3000/`);
      } catch (e) {
        res
          .status(500)
          .send({ error: "500 internal error", message: e.message });
      }
    }
  });
});
