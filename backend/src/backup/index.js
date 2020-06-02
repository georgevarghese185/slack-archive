const { backupConversations } = require('./conversations');
const { backupMembers } = require('./members');
const { backupMessages } = require('./messages');

const startBackup = async (context, backupId, token) => {
    const logger = context.getLogger();

    try {
        await backupConversations(context, backupId, token);
        context.models.backups.setStatus(backupId, 'COMPLETED');
    } catch (e) {
        logger.error('Error in backup');
        logger.error(e);

        await context.models.backups.setStatus(backupId, 'FAILED');
        await context.models.backups.setError(backupId, e.message);
    }
}

module.exports = {
    startBackup
}
