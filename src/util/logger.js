class Logger {
    log(...args) {
        if (!Logger.silent) {
            console.log(...args);
        }
    }

    info(...args) {
        if (!Logger.silent) {
            console.info(...args);
        }
    }

    error(...args) {
        if (!Logger.silent) {
            console.error(...args);
        }
    }
}

Logger.silent = false;

module.exports = Logger;