const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const firebase = require("firebase");
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

const { adminProducts, adminLoginREST } = require("./controllers/admin");
const { catalogo, productSearch } = require("./controllers/main");

const {
  addProductREST,
  updateProductREST,
  newFile,
  getProductsREST,
  deleteProductREST,
  getProductByIdREST,
} = require("./controllers/pruducts_APIREST");

const {
  newTransaction,
  successTransaction,
} = require("./controllers/transactions");

const { addUser, userLogin } = require("./controllers/usuarios");

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

app.post("/registro", addUser);

app.get("/login", (req, res) => {
  res.render("Login");
});

app.post("/login", userLogin);

app.post("/admin", adminLoginREST);

app.get("/admin", (req, res) => {
  res.render("Admin");
});

app.post("/transaction", newTransaction);

app.post("/success", successTransaction);
