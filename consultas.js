const { Pool } = require("pg");
// CREATE TABLE productos (id SERIAL PRIMARY KEY, stock INT CHECK(stock >=0) NOT NULL, price INT CHECK(price >=0) NOT NULL, image varchar(255) NOT NULL, category INT NOT NULL, description VARCHAR(500) NOT NULL, size VARCHAR(4) NOT NULL, gender VARCHAR(6) NOT NULL, color VARCHAR(10) NOT NULL)

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

module.exports = { getCategories };
