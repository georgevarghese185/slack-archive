const { backupConversations } = require('./conversations');
const { backupMembers } = require('./members');
const { backupMessages } = require('./messages');
const { BackupCanceledError } = require('../types/errors');

const startBackup = async (context, backupId, token) => {
    const logger = context.getLogger();

    try {
        await backupConversations(context, backupId, token);
        await backupMembers(context, backupId, token);
        await backupMessages(context, backupId, token);
        context.models.backups.setStatus(backupId, 'COMPLETED');
    } catch (e) {
        if (e instanceof BackupCanceledError) {
            await context.models.backups.setStatus(backupId, 'CANCELED');
            return;
        }

        logger.error('Error in backup');
        logger.error(e);

        await context.models.backups.setStatus(backupId, 'FAILED');
        await context.models.backups.setError(backupId, e.message);
    }
}

module.exports = {
    startBackup
}
