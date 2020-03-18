/**
 * A class for logging. Use this instead of `console`
 *
 * @property {boolean} silent - If set to true, logs will be silenced. Useful for
 * the console clean during unit tests
 */
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