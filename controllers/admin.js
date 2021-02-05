const jwt = require("jsonwebtoken");
const { getCategories, getProducts, adminLogin } = require("../consultas");
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

const adminLoginREST = async (req, res) => {
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
        if (err) {
          res.status(500).send(err);
        } else {
          console.log(jwt);
          res.send(jwt);
        }
      }
    );
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "500 internal error", message: e.message });
  }
};
module.exports = { adminProducts, adminLoginREST };
