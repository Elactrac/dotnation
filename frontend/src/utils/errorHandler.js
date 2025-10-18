/**
 * Custom error classes and error handling utilities for DotNation
 */

/**
 * Custom error class for blockchain-specific errors
 */
export class ChainError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ChainError';
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Predefined error codes
 */
export const ErrorCodes = {
  // Connection errors
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  DISCONNECTED: 'DISCONNECTED',
  
  // Wallet errors
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WALLET_UNAUTHORIZED: 'WALLET_UNAUTHORIZED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  
  // Transaction errors
  TX_FAILED: 'TX_FAILED',
  TX_REJECTED: 'TX_REJECTED',
  TX_TIMEOUT: 'TX_TIMEOUT',
  
  // Contract errors
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  INVALID_CAMPAIGN: 'INVALID_CAMPAIGN',
  CAMPAIGN_ENDED: 'CAMPAIGN_ENDED',
  GOAL_NOT_MET: 'GOAL_NOT_MET',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  
  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Result of the function
 */
export const retryWithBackoff = async (
  fn,
  options = {}
) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry = null,
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's the last attempt
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Don't retry certain errors
      if (shouldNotRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay, error);
      }
      
      console.warn(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
        error.message
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Determine if an error should not be retried
 */
const shouldNotRetry = (error) => {
  // Don't retry validation errors
  if (error.code === ErrorCodes.INVALID_INPUT ||
      error.code === ErrorCodes.INVALID_AMOUNT ||
      error.code === ErrorCodes.INVALID_ADDRESS) {
    return true;
  }
  
  // Don't retry user rejections
  if (error.code === ErrorCodes.TX_REJECTED ||
      error.code === ErrorCodes.WALLET_UNAUTHORIZED) {
    return true;
  }
  
  // Don't retry insufficient balance
  if (error.code === ErrorCodes.INSUFFICIENT_BALANCE) {
    return true;
  }
  
  return false;
};

/**
 * Parse blockchain errors into ChainError
 */
export const parseBlockchainError = (error) => {
  // Handle Polkadot.js errors
  if (error.message) {
    const msg = error.message.toLowerCase();
    
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return new ChainError(
        'Connection timeout. Please check your network.',
        ErrorCodes.CONNECTION_TIMEOUT,
        { originalError: error.message }
      );
    }
    
    if (msg.includes('disconnected') || msg.includes('connection closed')) {
      return new ChainError(
        'Lost connection to blockchain node.',
        ErrorCodes.DISCONNECTED,
        { originalError: error.message }
      );
    }
    
    if (msg.includes('insufficient') || msg.includes('balance')) {
      return new ChainError(
        'Insufficient balance to complete transaction.',
        ErrorCodes.INSUFFICIENT_BALANCE,
        { originalError: error.message }
      );
    }
    
    if (msg.includes('rejected') || msg.includes('cancelled')) {
      return new ChainError(
        'Transaction was rejected by user.',
        ErrorCodes.TX_REJECTED,
        { originalError: error.message }
      );
    }
    
    if (msg.includes('campaign not found') || msg.includes('invalid campaign')) {
      return new ChainError(
        'Campaign not found or invalid.',
        ErrorCodes.INVALID_CAMPAIGN,
        { originalError: error.message }
      );
    }
  }
  
  // Return generic error if we can't parse it
  return new ChainError(
    error.message || 'An unknown error occurred',
    ErrorCodes.UNKNOWN_ERROR,
    { originalError: error }
  );
};

/**
 * Format error for user display
 */
export const formatErrorForUser = (error) => {
  if (error instanceof ChainError) {
    return error.message;
  }
  
  // Handle common Polkadot.js errors
  if (error.message) {
    const msg = error.message;
    
    if (msg.includes('1010: Invalid Transaction')) {
      return 'Insufficient balance to pay transaction fees.';
    }
    
    if (msg.includes('No extension')) {
      return 'Polkadot.js extension not found. Please install it.';
    }
    
    if (msg.includes('No accounts')) {
      return 'No accounts found in wallet. Please add an account.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const chainError = parseBlockchainError(error);
      console.error('Async handler caught error:', chainError);
      throw chainError;
    }
  };
};

/**
 * Safe promise wrapper that never throws
 */
export const safePromise = async (promise) => {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: parseBlockchainError(error) };
  }
};
