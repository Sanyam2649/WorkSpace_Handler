const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logFormat = format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = createLogger({
  level: 'info', // Minimum log level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport for all logs
    new transports.Console(),

    // Daily rotate file transport for error logs
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d', // Keep logs for 30 days
      zippedArchive: true, // Compress old logs
    }),

    // Daily rotate file transport for warn logs
    new DailyRotateFile({
      filename: 'logs/warn-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      maxFiles: '30d',
      zippedArchive: true,
    }),

    // Daily rotate file transport for info logs
    new DailyRotateFile({
      filename: 'logs/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxFiles: '30d',
      zippedArchive: true,
    }),
  ],
});

module.exports = logger;
