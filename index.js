const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const { getCategories } = require("./consultas.js");

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
