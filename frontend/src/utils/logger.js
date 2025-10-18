/**
 * Comprehensive logging utility for DotNation
 * Integrates with Sentry for error tracking and performance monitoring
 */

import { trackError, addBreadcrumb, trackEvent, trackPerformance } from './sentry';

/**
 * Log levels
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

/**
 * Get current log level from environment
 */
const getLogLevel = () => {
  const env = import.meta.env.MODE;
  if (env === 'development') return LogLevel.DEBUG;
  if (env === 'production') return LogLevel.WARN;
  return LogLevel.INFO;
};

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const levelName = Object.keys(LogLevel)[level].toLowerCase();
  const contextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';

  return `[${timestamp}] ${levelName.toUpperCase()}: ${message}${contextStr}`;
};

/**
 * Base logger class
 */
class Logger {
  constructor(namespace = 'app') {
    this.namespace = namespace;
    this.minLevel = getLogLevel();
  }

  /**
   * Log a message at the specified level
   */
  log(level, message, context = {}, error = null) {
    if (level < this.minLevel) return;

    const formattedMessage = formatMessage(level, `[${this.namespace}] ${message}`, context);

    // Console logging
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage, error);
        break;
    }

    // Sentry integration
    this.sendToSentry(level, message, context, error);
  }

  /**
   * Send log to Sentry
   */
  sendToSentry(level, message, context, error) {
    const sentryLevel = this.mapToSentryLevel(level);

    if (error && (level === LogLevel.ERROR || level === LogLevel.FATAL)) {
      // Send error to Sentry
      trackError(error, {
        tags: {
          logger: this.namespace,
          log_level: Object.keys(LogLevel)[level].toLowerCase(),
        },
        extra: {
          message,
          ...context,
        },
      });
    } else {
      // Add breadcrumb for non-error logs
      addBreadcrumb(message, this.namespace, sentryLevel);

      // Track events for important logs
      if (level >= LogLevel.INFO) {
        trackEvent(`log_${Object.keys(LogLevel)[level].toLowerCase()}`, {
          namespace: this.namespace,
          message,
          ...context,
        });
      }
    }
  }

  /**
   * Map log level to Sentry level
   */
  mapToSentryLevel(level) {
    switch (level) {
      case LogLevel.DEBUG:
        return 'debug';
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARN:
        return 'warning';
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return 'error';
      default:
        return 'info';
    }
  }

  /**
   * Debug level logging
   */
  debug(message, context = {}) {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level logging
   */
  info(message, context = {}) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning level logging
   */
  warn(message, context = {}, error = null) {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Error level logging
   */
  error(message, context = {}, error = null) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Fatal level logging
   */
  fatal(message, context = {}, error = null) {
    this.log(LogLevel.FATAL, message, context, error);
  }

  /**
   * Performance logging
   */
  performance(operation, duration, context = {}) {
    const message = `Performance: ${operation} took ${duration}ms`;
    this.info(message, { operation, duration, ...context });

    // Track performance in Sentry
    trackPerformance(operation, duration, 'ms');
  }

  /**
   * API call logging
   */
  apiCall(endpoint, method, duration, success, context = {}) {
    const status = success ? 'success' : 'failed';
    const message = `API ${method} ${endpoint} - ${status} (${duration}ms)`;
    const level = success ? LogLevel.INFO : LogLevel.WARN;

    this.log(level, message, {
      endpoint,
      method,
      duration,
      success,
      ...context,
    });
  }

  /**
   * User action logging
   */
  userAction(action, context = {}) {
    this.info(`User action: ${action}`, {
      action_type: 'user_interaction',
      ...context,
    });
  }

  /**
   * Wallet operation logging
   */
  walletOperation(operation, success, context = {}) {
    const status = success ? 'success' : 'failed';
    const message = `Wallet ${operation} - ${status}`;
    const level = success ? LogLevel.INFO : LogLevel.WARN;

    this.log(level, message, {
      operation_type: 'wallet',
      operation,
      success,
      ...context,
    });
  }

  /**
   * Transaction logging
   */
  transaction(txHash, operation, success, context = {}) {
    const status = success ? 'success' : 'failed';
    const message = `Transaction ${operation} - ${status}`;
    const level = success ? LogLevel.INFO : LogLevel.WARN;

    this.log(level, message, {
      operation_type: 'transaction',
      txHash,
      operation,
      success,
      ...context,
    });
  }
}

/**
 * Create a logger instance for a specific namespace
 */
export const createLogger = (namespace) => {
  return new Logger(namespace);
};

/**
 * Default application logger
 */
export const logger = new Logger('app');

/**
 * Specialized loggers for different parts of the app
 */
export const loggers = {
  api: createLogger('api'),
  wallet: createLogger('wallet'),
  campaign: createLogger('campaign'),
  ui: createLogger('ui'),
  auth: createLogger('auth'),
  error: createLogger('error'),
};

/**
 * Log unhandled promise rejections
 */
export const setupUnhandledRejectionLogging = () => {
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason?.message || event.reason,
      promise: event.promise,
    }, event.reason);
  });
};

/**
 * Log uncaught errors
 */
export const setupUncaughtErrorLogging = () => {
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, event.error);
  });
};

/**
 * Initialize logging system
 */
export const initLogging = () => {
  setupUnhandledRejectionLogging();
  setupUncaughtErrorLogging();

  logger.info('Logging system initialized', {
    environment: import.meta.env.MODE,
    log_level: Object.keys(LogLevel)[getLogLevel()].toLowerCase(),
  });
};

export default logger;