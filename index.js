const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const axios = require("axios");
const Handlebars = require("handlebars");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const optionsForm = require("./optionsForm");
const firebase = require("firebase");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const firebaseConfig = require("./firebaseconfig");
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
  let year = fecha.getFullYear();
  let month = fecha.getMonth() + 1;
  let day = fecha.getDate();
  return `${day}/${month}/${year}`;
});

const { adminProducts } = require("./controllers/admin");
const { catalogo, productSearch } = require("./controllers/main");

const {
  addProductREST,
  updateProductREST,
  newFile,
  getProductsREST,
  deleteProductREST,
  getProductByIdREST,
} = require("./controllers/pruducts_APIREST");

app.get("/admin/productos", adminProducts);

app.post("/productos", addProductREST);

app.put("/productos/:id", updateProductREST);

app.post("/files", newFile);

app.get("/productos", getProductsREST);

app.delete("/productos/:id", deleteProductREST);

app.get("/producto/:id", getProductByIdREST);

app.get("/", catalogo);

app.get("/busqueda/:filtro/:input", productSearch);

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
        exp: Math.floor(Date.now() / 1000) + 600,
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
