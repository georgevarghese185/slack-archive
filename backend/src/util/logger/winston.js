const { createLogger, format, transports } = require('winston');
const Logger = require('./Logger');
const { combine, timestamp, label, printf } = format;

module.exports = class WinstonLogger extends Logger {
    constructor(context) {
        super();

        this._logger = createLogger({
            level: context.isDevEnvironment() ? 'debug' : 'info',
            format: combine(
                timestamp(),
                printf(({ level, message, timestamp }) => {
                    return `[${timestamp} ${level.toUpperCase()}]: ${message}`;
                })
            ),
            transports: [new transports.Console()]
        });
    }

    log(...args) {
        this._logger.debug(this._formatArgs(args))
    }

    error(...args) {
        this._logger.error(this._formatArgs(args))
    }

    info(...args) {
        this._logger.info(this._formatArgs(args))
    }

    warn(...args) {
        this._logger.warn(this._formatArgs(args))
    }

    _formatArgs(args) {
        return args.map(arg => {
            if (arg instanceof Error) {
                return arg.stack;
            } else if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            } else {
                return arg + '';
            }
        }).join('\n');
    }
}
