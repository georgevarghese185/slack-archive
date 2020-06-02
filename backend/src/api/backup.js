const constants = require('../constants');
const Response = require('../types/Response');
const uuid = require('uuid').v4;
const { notFound } = require('../util/response');

const getStats = async (context, request) => {
    const messages = await context.models.messages.count();
    const conversations = await context.models.conversations.count();
    const lastBackup = await context.models.backups.last();
    const lastBackupAt = lastBackup ? lastBackup.endedAt : null;

    const stats = { messages, conversations, lastBackupAt };

    return new Response({
        status: 200,
        body: stats
    });
}


const create = async (context, request, token) => {
    const userId = token.userId;
    const backupId = uuid();

    await context.models.backups.create(backupId, userId);
    context.actions.startBackup(backupId, token);

    return new Response({
        status: 200,
        body: {
            backupId
        }
    });
}


const get = async (context, request) => {
    const backupId = request.parameters.id;
    const backup = await context.models.backups.get(backupId);

    if(!backup) {
        return notFound(constants.errorCodes.backupNotFound, "Could not find a backup task with the given ID");
    }

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


const cancel = async (context, request) => {
    const backupId = request.parameters.id;
    const backupTask = await context.models.backups.get(backupId);

    if(!backupTask) {
        return notFound(constants.errorCodes.backupNotFound, "Could not find a backup task with the given ID");
    }

    await context.models.backups.cancel(backupId);
    return new Response({ status: 200 });
}


module.exports = {
    getStats,
    create,
    get,
    cancel
}