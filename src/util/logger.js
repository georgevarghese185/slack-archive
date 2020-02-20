class Logger {
    constructor(options = {}) {
        const testMode = options.testMode;
        this.testMode = testMode;
    }

    log(...args) {
        if (!this.testMode) {
            console.log(...args);
        }
    }

    info(...args) {
        if (!this.testMode) {
            console.info(...args);
        }
    }

    error(...args) {
        if (!this.testMode) {
            console.error(...args);
        }
    }
}

let instance = null;

module.exports = {
    createInstance(options) {
        instance = new Logger(options);
        return instance;
    },
    getInstance() {
        return instance;
    }
}