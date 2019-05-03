const Sequelize = require('sequelize');
const Models = require('./models');
const DBConfig = require('../config/db')

const setupSequelize = async () => {
  const dbConfig = DBConfig();
  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      dialect: dbConfig.dialect,
      host: dbConfig.host,
      port: dbConfig.port
    }
  );

  const models = Models(sequelize);

  await sequelize.sync({ force: false });
  console.log("\nSEQUELIZE STARTED");

  return { sequelize, models }
}

module.exports = {
  setupSequelize
}
