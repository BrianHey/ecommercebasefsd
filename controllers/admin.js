const jwt = require("jsonwebtoken");
const { getCategories, getProducts } = require("../consultas");
const optionsForm = require("../optionsForm");

const adminProducts = (req, res) => {
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
};

module.exports = { adminProducts };
