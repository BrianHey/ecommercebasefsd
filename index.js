const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
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

const { getCategories, addProduct, getProducts } = require("./consultas.js");

app.listen(3000);

app.use("/css", express.static(__dirname + "/assets/css"));
app.use("/js", express.static(__dirname + "/assets/js"));

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

app.get("/admin/productos", async (req, res) => {
  const productos = await getProducts();
  res.render("Productos", {
    products: JSON.stringify(productos),
    productos,
    // productos: encodeURIComponent(JSON.stringify(productos)),
  });
});

app.get("/categories", async (req, res) => {
  const categories = await getCategories();
  res.send(categories);
});

app.post("/productos", async (req, res) => {
  let productos = req.body;
  console.log(req.body);
  console.log(req.files);
  try {
    console.log(productos.image);
    productos = Object.values(productos);
    const result = await addProduct(productos);
    res.status(201).send();
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "500 Internal Error", message: e.message });
  }
});

app.post("/files", (req, res) => {
  console.log(req.files);
  const { image } = req.files;
  const path = `assets/images/${image.name}`;
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
