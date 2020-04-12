/**
 * A class for logging. Use this instead of `console`
 */
class Logger {
    log(...args) {
        console.log(...args);
    }

    info(...args) {
        console.info(...args);
    }

    error(...args) {
        console.error(...args);
    }
}

module.exports = Logger;