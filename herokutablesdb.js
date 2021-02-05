const { Pool } = require("pg");
// CREATE TABLE productos (id SERIAL PRIMARY KEY, stock INT  NOT NULL, price INT CHECK(price >=0) NOT NULL, image varchar(255) NOT NULL, category INT NOT NULL, description VARCHAR(500) NOT NULL, size VARCHAR(4) NOT NULL, gender VARCHAR(6) NOT NULL, color VARCHAR(10) NOT NULL, model VARCHAR(50), created DATESTAMP)
// CREATE TABLE admin (id SERIAL PRIMARY KEY, username VARCHAR(50), password varchar(50));
// CREATE TABLE transactions (id SERIAL PRIMARY KEY, order_number VARCHAR(100), date DATE, amount FLOAT, card_detail INT, payment_type VARCHAR(5)) ;
// CREATE TABLE categories (id SERIAL PRIMARY KEY, name VARCHAR(100)) ;

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

// pool.query(
//   "CREATE TABLE productos (id SERIAL PRIMARY KEY, stock INT  NOT NULL, price INT CHECK(price >=0) NOT NULL, image varchar(255) NOT NULL, category INT NOT NULL, description VARCHAR(500) NOT NULL, size VARCHAR(4) NOT NULL, gender VARCHAR(6) NOT NULL, color VARCHAR(10) NOT NULL, model VARCHAR(50), created TIMESTAMP)"
// );
// pool.query(
//   "CREATE TABLE admin (id SERIAL PRIMARY KEY, username VARCHAR(50), password varchar(50));"
// );
// pool.query(
//   "CREATE TABLE transactions (id SERIAL PRIMARY KEY, order_number VARCHAR(100), date DATE, amount FLOAT, card_detail INT, payment_type VARCHAR(5)) ;"
// );
// pool.end();

// pool.query("INSERT INTO admin (username, password) values ('Pedro', 'goku')");

// pool.query(
//   "INSERT INTO categories (name) VALUES ('Poleras') ;",
//   (err, data) => {
//     console.log(err);
//     console.log(data);
//   }
// );
// pool.end();
