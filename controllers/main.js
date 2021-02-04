const { getProducts } = require("../consultas.js");
const catalogo = async (req, res) => {
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
};

const productSearch = async (req, res) => {
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
};

module.exports = { catalogo, productSearch };
