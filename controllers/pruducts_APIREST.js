const {
  addProduct,
  updateProduct,
  getProducts,
  deleteProduct,
  getCategories,
} = require("../consultas.js");
const { v4: uuidv4 } = require("uuid");

const addProductREST = async (req, res) => {
  let productos = req.body;

  try {
    productos = Object.values(productos);
    const result = await addProduct(productos);
    res.status(201).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "500 Internal Error", message: e.message });
  }
};

const updateProductREST = async (req, res) => {
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
};

const newFile = (req, res) => {
  const { image } = req.files;
  console.log(image);
  const format = image.mimetype.split("/")[1];
  const path = `assets/images/${uuidv4().slice(30)}.${format}`;
  image.mv(path, (err) => {
    err ? res.status(500).send("Something wrong...") : res.send(path);
  });
};

const getProductsREST = async (req, res) => {
  try {
    const respuesta = await getProducts();
    res.send(respuesta);
  } catch (err) {
    res.status(500).send({ message: err.message, error: "Error 500." });
  }
};

const deleteProductREST = async (req, res) => {
  const { id } = req.params;

  const respuesta = await deleteProduct(id);
  respuesta > 0
    ? res.send({ status: "200", message: "Producto Eliminado" })
    : res.status(500).send({
        message: "No existe un registro con el id indicado",
        error: "Error 500.",
      });
};

const getProductByIdREST = async (req, res) => {
  const { id } = req.params;
  const promiseOptions = await Promise.all([getProducts(), getCategories()]);
  const [productos, categories] = promiseOptions;
  productos.forEach((p) => {
    p.category = categories.find((c) => c.id == p.category).name;
  });
  let producto = productos.find((p) => p.id == id);
  res.render("Details", { producto, productoData: JSON.stringify(producto) });
};

module.exports = {
  addProductREST,
  updateProductREST,
  newFile,
  getProductsREST,
  deleteProductREST,
  getProductByIdREST,
};
