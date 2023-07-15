const Sequelize = require("sequelize");
const { seed } = require("../seeds/lotesConsult");
const sequelize = new Sequelize("database", "username", "password", {
  dialect: "sqlite",
  storage: "./database.sqlite",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    seed();
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

module.exports = sequelize;
