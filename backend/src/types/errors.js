class BackupCanceledError extends Error {
    constructor(...args) {
        super(...args);
    }
}

module.exports = {
    BackupCanceledError
}