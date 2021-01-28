const express = require("express");
const app = express();
const router = express.Router();
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  fileUpload({
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: "Supero el límte",
  })
);

const { getCategories, addProduct } = require("./consultas.js");

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

app.get("/admin/productos", (req, res) => {
  res.render("Productos");
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
