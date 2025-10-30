/**
 * @file Production Logger with Winston
 * Structured logging with multiple transports
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Transports
const transports = [
  // Console transport (always enabled)
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? format : consoleFormat,
  }),
];

// File transports for production
if (process.env.NODE_ENV === 'production') {
  // Error logs - rotated daily, kept for 30 days
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      maxSize: '20m',
      format,
    })
  );

  // Combined logs - rotated daily, kept for 14 days
  transports.push(
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      format,
    })
  );

  // HTTP access logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxFiles: '7d',
      maxSize: '20m',
      format,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format,
  transports,
  // Don't exit on uncaught exceptions (let PM2 handle it)
  exitOnError: false,
});

// Stream for Morgan HTTP logger
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

/**
 * Log with context and metadata
 */
logger.logWithContext = function(level, message, context = {}) {
  this[level](message, {
    ...context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};

/**
 * Log API request
 */
logger.logRequest = function(req, duration) {
  this.http('API Request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    duration: `${duration}ms`,
  });
};

/**
 * Log API error
 */
logger.logError = function(err, req) {
  this.error('API Error', {
    error: err.message,
    stack: err.stack,
    method: req?.method,
    path: req?.path,
    ip: req?.ip,
    body: req?.body,
  });
};

/**
 * Log fraud detection event
 */
logger.logFraudDetection = function(campaign, result) {
  this.warn('Fraud Detection', {
    campaignId: campaign.id || 'new',
    title: campaign.title,
    riskScore: result.overallRiskScore,
    riskLevel: result.riskLevel,
    recommendation: result.recommendation,
  });
};

/**
 * Log captcha event
 */
logger.logCaptcha = function(action, data) {
  this.info('Captcha Event', {
    action,
    ...data,
  });
};

/**
 * Log AI usage
 */
logger.logAIUsage = function(endpoint, prompt, responseTime, tokens = null) {
  this.info('AI Usage', {
    endpoint,
    promptLength: prompt.length,
    responseTime: `${responseTime}ms`,
    tokens,
  });
};

module.exports = logger;
