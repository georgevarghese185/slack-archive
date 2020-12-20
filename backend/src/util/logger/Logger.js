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

    warn (...args) {
        console.warn(...args);
    }

    error(...args) {
        console.error(...args);
    }
}

module.exports = Logger;