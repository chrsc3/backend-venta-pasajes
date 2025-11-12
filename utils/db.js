const Sequelize = require("sequelize");
const {
  MYSQL_DATABASE,
  MYSQL_HOST,
  MYSQL_PASWORD,
  MYSQL_USER,
  MYSQL_PORT,
} = require("./config");

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASWORD, {
  dialect: "mysql",
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  ssl: true,
  timezone: "-04:00", // Zona horaria de Bolivia (GMT-4)
  dialectOptions: {
    timezone: "-04:00",
  },
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("connected to the database");
  } catch (err) {
    console.log("failed to connect to the database");
    return process.exit(1);
  }

  return null;
};

module.exports = { connectToDatabase, sequelize };
