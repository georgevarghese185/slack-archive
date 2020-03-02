const Response = require('../../types/Response');

const getStats = async (request, models) => {
    const messages = await models.messages.count();
    const conversations = await models.conversations.count();
    const lastBackup = await models.backups.last();
    const lastBackupAt = lastBackup ? lastBackup.endedAt : null;

    const stats = { messages, conversations, lastBackupAt };

    return new Response({
        status: 200,
        body: stats
    });
}


module.exports = {
    getStats
}