const Backups = require('../../models/implementations/sequelize/Backups');
const Conversations = require('../../models/implementations/sequelize/Conversations');
const Messages = require('../../models/implementations/sequelize/Messages');
const { Sequelize } = require('sequelize');

const setupSequelize = async (context) => {
    const sequelize = new Sequelize(process.env.DB_URL);

    const backups = new Backups(sequelize);
    const conversations = new Conversations(sequelize);
    const messages = new Messages(sequelize);

    await sequelize.sync();

    context.setModels({
        backups,
        conversations,
        messages
    });
}

module.exports = {
    setupSequelize
}