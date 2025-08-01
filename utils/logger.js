const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'butik-proje' },
  transports: [
    new winston.transports.File({
  filename: path.join(__dirname, '../logs/error.log'),
  level: 'error',
  maxsize: 5242880,
  maxFiles: 5
}),
new winston.transports.File({
  filename: path.join(__dirname, '../logs/combined.log'),
  maxsize: 5242880,
  maxFiles: 5
})
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

const log = {
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
  
  api: (req, res, responseTime) => {
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      responseTime: `${responseTime}ms`,
      statusCode: res.statusCode
    });
  },
  
  user: (action, userId, details = {}) => {
    logger.info('User Action', {
      action,
      userId,
      ...details
    });
  },
  
  security: (event, details = {}) => {
    logger.warn('Security Event', {
      event,
      ...details
    });
  }
};

module.exports = log; 