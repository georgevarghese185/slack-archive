const Sequelize = require('sequelize');
const Models = require('./models');
const {getConfig} = require('./config')

const setupSequelize = async () => {
  const dbConfig = getConfig();

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
