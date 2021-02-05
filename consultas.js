const { Pool } = require("pg");
// CREATE TABLE productos (id SERIAL PRIMARY KEY, stock INT  NOT NULL, price INT CHECK(price >=0) NOT NULL, image varchar(255) NOT NULL, category INT NOT NULL, description VARCHAR(500) NOT NULL, size VARCHAR(4) NOT NULL, gender VARCHAR(6) NOT NULL, color VARCHAR(10) NOT NULL, model VARCHAR(50), created DATESTAMP)
// CREATE TABLE admin (id SERIAL PRIMARY KEY, username VARCHAR(50), password varchar(50));
// CREATE TABLE transactions (id SERIAL PRIMARY KEY, order_number VARCHAR(100), date DATE, amount FLOAT, card_detail INT, payment_type VARCHAR(5)) ;

const pool = new Pool({
  user: "tplrzbxxgmngiz",
  host: "ec2-52-6-178-202.compute-1.amazonaws.com",
  password: "a164953b1510e4cbf039b6b75b81758d432b5ee8a0316cc3c9678c3bbb7e29f4",
  database: "ddqoipu3q33op8",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
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

const deleteProduct = async (id) => {
  const result = await pool.query("DELETE FROM productos WHERE id = $1", [id]);
  return result.rowCount;
};

const adminLogin = async (values) => {
  const result = await pool.query(
    "SELECT * from admin WHERE username = $1 AND password = $2",
    values
  );
  return result.rows[0];
};

const addTransaction = async (values) => {
  const result = await pool.query(
    "INSERT INTO transactions (order_number, date, amount, card_detail, payment_type) values ($1,$2,$3,$4,$5) RETURNING *",
    values
  );
  console.log(result.rows[0]);
  return result.rows;
};

module.exports = {
  getCategories,
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  adminLogin,
  addTransaction,
};
