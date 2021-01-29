const { Pool } = require("pg");
// CREATE TABLE productos (id SERIAL PRIMARY KEY, stock INT  NOT NULL, price INT CHECK(price >=0) NOT NULL, image varchar(255) NOT NULL, category INT NOT NULL, description VARCHAR(500) NOT NULL, size VARCHAR(4) NOT NULL, gender VARCHAR(6) NOT NULL, color VARCHAR(10) NOT NULL)

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgres",
  database: "ecommerce",
  port: 5432,
});

const getCategories = async () => {
  const result = await pool.query("SELECT * FROM categories");
  return result.rows;
};

const addProduct = async (values) => {
  const result = await pool.query(
    "INSERT INTO productos (stock, price, image, category, description, size, gender, color, model,created) values ($1,$2,$3,$4,$5,$6,$7,$8, $9, NOW()) RETURNING *",
    values
  );
  console.log(result.rows[0]);
  return result.rows;
};

const updateProduct = async (values) => {
  const result = await pool.query(
    "UPDATE productos SET stock = $1, price = $2, image = $3, category =$4, description =$5, size =$6, gender =$7, color =$8, model =$9 WHERE id = $10 RETURNING *",
    values
  );
  console.log(result.rows[0]);
  return result.rows;
};

const getProducts = async () => {
  const result = await pool.query("SELECT * FROM productos");
  return result.rows;
};

module.exports = { getCategories, addProduct, getProducts, updateProduct };
