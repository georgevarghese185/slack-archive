const { setupSequelize } = require('../src/server/express/sequelize');
const AppContext = require('../src/AppContext');

const main = async () => {
    const sequelize = await setupSequelize(new AppContext());

    const {
        backups,
        members,
        conversations,
        messages
    } = sequelize.models;

    await Promise.all([
        backups.destroy({ truncate: true }),
        members.destroy({ truncate: true }),
        conversations.destroy({ truncate: true }),
        messages.destroy({ truncate: true })
    ]);

    await sequelize.close();
}

main().catch(console.error);