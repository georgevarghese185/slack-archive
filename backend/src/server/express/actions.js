const { startBackup } = require('../../backup');

const setupActions = (context) => {
    context.setActions({
        startBackup: (backupId, token) => startBackup(context, backupId, token)
    });
}

module.exports = {
    setupActions
};