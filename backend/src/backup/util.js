const { BackupCanceledError } = require('../types/errors');

const handleCancellation = async (context, backupId) => {
    const shouldCancel = await context.models.backups.shouldCancel(backupId);
    if (shouldCancel) {
        throw new BackupCanceledError();
    }
}

module.exports = {
    handleCancellation
}
