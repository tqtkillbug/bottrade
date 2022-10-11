const winston = require('winston');
const path = require('path');
const logLevel = 'debug';
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.label({ label: ' Bot_Trade ' }),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
        winston.format.timestamp({
            format: 'YYYY-DD-MM HH:mm:ss'
          }),
        winston.format.colorize(),
        winston.format.printf((info) => {
            if(info.stack) return `[${info.timestamp}] [${info.level}] ${info.stack}`;
            return `${info.timestamp}:${info.label}:${info.message}`
        })
      ),
    transports: [
        // new(winston.transports.Console)({
        //     level: logLevel,
        //     colorize: true,
        //     timestamp: function () {
        //         return (new Date()).toLocaleTimeString();
        //     },
        //     prettyPrint: true
        // }),
       new winston.transports.File({filename: path.join(__dirname, 'combine.log')})
    ]
})
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green'
});

module.exports = logger;
