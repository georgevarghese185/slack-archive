const Response = require('../../types/Response');
const uuid = require('uuid').v4;

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


const create = async (request, token, models, actions) => {
    const userId = token.userId;
    const backupId = uuid();

    await models.backups.create(backupId, userId);
    actions.startBackup(backupId);

    return new Response({
        status: 200,
        body: {
            backupId
        }
    });
}


const get = async (request, models) => {
    const backupId = request.parameters.id;
    const backup = await models.backups.get(backupId);

    const body = {
        status: backup.status,
        error: backup.error,
        messagesBackedUp: backup.messagesBackedUp,
        currentConversation: backup.currentConversation,
        backedUpConversations: backup.backedUpConversations,
    };

    return new Response({
        status: 200,
        body
    });
}


module.exports = {
    getStats,
    create,
    get
}