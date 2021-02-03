const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const optionsForm = require("./optionsForm");
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

app.get("/admin/productos", async (req, res) => {
  const promiseOptions = await Promise.all([getProducts(), getCategories()]);
  const [productos, categories] = promiseOptions;
  const { sizes, colors, genders } = optionsForm;
  console.log(productos);
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
  res.render("Details", { producto });
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
