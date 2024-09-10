require("dotenv").config();

const PORT = process.env.PORT;
const MYSQL_DATABASE =
  process.env.NODE_ENV === "development"
    ? process.env.DB_NAMETEST
    : process.env.DB_NAME;
const MYSQL_PASWORD = process.env.DB_PASSWORD;
const MYSQL_USER = process.env.DB_USER;
const MYSQL_HOST = process.env.DB_HOST;
const MYSQL_PORT = process.env.DB_PORT;
const SECRET = process.env.SECRET;
module.exports = {
  PORT,
  MYSQL_DATABASE,
  MYSQL_PASWORD,
  MYSQL_USER,
  MYSQL_HOST,
  MYSQL_PORT,
  SECRET,
};
