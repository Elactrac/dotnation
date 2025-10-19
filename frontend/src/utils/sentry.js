import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry error tracking and performance monitoring
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || 'development';

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      new BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/yourdomain\.com\/api/,
          /^https:\/\/dotnation\.vercel\.app\/api/,
        ],
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // Capture 100% of transactions in development, 10% in production

    // Release Health
    autoSessionTracking: true,

    // Error filtering and context
    beforeSend(event, hint) {
      // Filter out development errors in production
      if (environment === 'production' && event.exception) {
        const error = hint.originalException;
        if (error && error.message && error.message.includes('development')) {
          return null;
        }
      }

      // Add custom context
      event.tags = {
        ...event.tags,
        component: 'frontend',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      };

      // Sanitize sensitive data
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers['x-api-key'];
      }

      return event;
    },

    // User feedback
    beforeSendFeedback(event) {
      console.log('User feedback captured:', event);
      return event;
    },
  });

  // Set user context if available
  Sentry.setTag('component', 'frontend');

  console.log(`Sentry initialized for ${environment} environment`);
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.address,
      username: user.meta?.name || `User ${user.address?.substring(0, 8)}`,
      wallet: 'polkadot-js',
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Track custom events and metrics
 */
export const trackEvent = (eventName, properties = {}) => {
  // Sentry custom events
  Sentry.captureMessage(eventName, {
    level: 'info',
    tags: {
      event_type: 'custom',
      event_name: eventName,
    },
    extra: properties,
  });

  // Also send to console in development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}:`, properties);
  }
};

/**
 * Track performance metrics
 */
export const trackPerformance = (name, value, unit = 'ms') => {
  // Log performance metric
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}: ${value}${unit}`);
  }
};

/**
 * Track errors with additional context
 */
export const trackError = (error, context = {}) => {
  Sentry.captureException(error, {
    tags: {
      error_type: 'application',
      ...context.tags,
    },
    extra: {
      ...context.extra,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    },
  });

  // Also log to console
  console.error('[Error Tracked]', error, context);
};

/**
 * Create a performance transaction
 */
export const startTransaction = (name, op = 'navigation') => {
  return Sentry.startSpan({
    name,
    op,
  }, () => {});
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message, category = 'custom', level = 'info') => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
  });

  if (import.meta.env.DEV) {
    console.log(`[Breadcrumb] ${category}: ${message}`);
  }
};

/**
 * Flush pending events (useful before page unload)
 */
export const flushEvents = async (timeout = 2000) => {
  return await Sentry.flush(timeout);
};

/**
 * Close Sentry (useful for testing)
 */
export const closeSentry = () => {
  Sentry.close();
};

export default {
  initSentry,
  setUserContext,
  trackEvent,
  trackPerformance,
  trackError,
  startTransaction,
  addBreadcrumb,
  flushEvents,
  closeSentry,
};