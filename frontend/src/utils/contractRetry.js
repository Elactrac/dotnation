/**
 * Contract-specific retry utility with exponential backoff
 * Handles transient network errors and blockchain node issues
 */

import { parseBlockchainError, ErrorCodes } from './errorHandler';
import { CONTRACT_LIMITS } from '../config/constants';

const MAX_STORAGE_DEPOSIT_STRING = CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT.toString();
const DEFAULT_REF_TIME = 3_000_000_000; // 3 billion
const DEFAULT_PROOF_SIZE = 1_048_576; // 1 MB

const toBigInt = (value) => {
  if (value === null || value === undefined) {
    return 0n;
  }

  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    return BigInt(Math.trunc(value));
  }

  if (typeof value === 'string') {
    return BigInt(value);
  }

  if (typeof value.toString === 'function') {
    return BigInt(value.toString());
  }

  return 0n;
};

/**
 * Determine if a contract error is transient and can be retried
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is transient
 */
export const isTransientError = (error) => {
  // Parse to ChainError if needed
  const chainError = error.code ? error : parseBlockchainError(error);
  
  // Transient error codes that should be retried
  const transientCodes = [
    ErrorCodes.CONNECTION_TIMEOUT,
    ErrorCodes.CONNECTION_FAILED,
    ErrorCodes.DISCONNECTED,
    ErrorCodes.TX_TIMEOUT,
  ];
  
  if (transientCodes.includes(chainError.code)) {
    return true;
  }
  
  // Check error messages for transient patterns
  const msg = error.message?.toLowerCase() || '';
  const transientPatterns = [
    'timeout',
    'network error',
    'connection',
    'unavailable',
    'too many requests',
    'rate limit',
    'try again',
  ];
  
  return transientPatterns.some(pattern => msg.includes(pattern));
};

/**
 * Determine if an error should not be retried
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error should not be retried
 */
export const shouldNotRetry = (error) => {
  // Parse to ChainError if needed
  const chainError = error.code ? error : parseBlockchainError(error);
  
  // Non-retryable error codes
  const nonRetryableCodes = [
    ErrorCodes.WALLET_NOT_FOUND,
    ErrorCodes.WALLET_NOT_CONNECTED,
    ErrorCodes.WALLET_UNAUTHORIZED,
    ErrorCodes.TX_REJECTED,
    ErrorCodes.INSUFFICIENT_BALANCE,
    ErrorCodes.INVALID_INPUT,
    ErrorCodes.INVALID_AMOUNT,
    ErrorCodes.INVALID_ADDRESS,
    ErrorCodes.INVALID_CAMPAIGN,
  ];
  
  if (nonRetryableCodes.includes(chainError.code)) {
    return true;
  }
  
  // Check error message for non-retryable patterns
  const msg = error.message?.toLowerCase() || '';
  const nonRetryablePatterns = [
    'rejected',
    'cancelled',
    'unauthorized',
    'not authorized',
    'not connected',
    'wallet not',
    'extension not',
    'invalid',
    'not found',
    'already claimed',
    'already withdrawn',
    'not active',
    'not failed',
    'no donation',
  ];
  
  return nonRetryablePatterns.some(pattern => msg.includes(pattern));
};

/**
 * Retry a contract query or transaction with exponential backoff
 * @param {Function} fn - The contract function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Result of the contract function
 */
export const retryContractCall = async (fn, options = {}) => {
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
      
      // Check if error should not be retried
      if (shouldNotRetry(error)) {
        throw error;
      }
      
      // Check if error is not transient
      if (!isTransientError(error)) {
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
 * Execute a contract query with retry logic
 * @param {Object} contract - The contract instance
 * @param {string} method - The query method name
 * @param {string} address - The caller address
 * @param {Array} args - Additional arguments for the query
 * @param {Object} options - Retry options (can include api instance)
 * @returns {Promise} - Query result
 */
export const executeContractQuery = async (
  contract,
  method,
  address,
  args = [],
  options = {}
) => {
  if (!contract) {
    throw new Error('Contract not loaded');
  }
  
  if (!address) {
    throw new Error('Wallet not connected');
  }
  
  // Create proper gas limit using API if available
  const gasLimit = options.api && options.api.registry
    ? options.api.registry.createType('WeightV2', { refTime: DEFAULT_REF_TIME, proofSize: DEFAULT_PROOF_SIZE })
    : { refTime: DEFAULT_REF_TIME, proofSize: DEFAULT_PROOF_SIZE };
  
  const queryFn = async () => {
    // For Paseo/production chains, use a large storage deposit limit for dry-run queries
    // Setting to 10 DOT (10_000_000_000_000) should be sufficient for most operations
    // The actual amount will be calculated and returned in storageDeposit
  const storageLimit = MAX_STORAGE_DEPOSIT_STRING;
    
    const queryOptions = {
      ...options.queryOptions,
      storageDepositLimit: storageLimit,
    };

    const { gasRequired, storageDeposit, result } = await contract.query[method](
      address,
      { gasLimit, ...queryOptions },
      ...args
    );
    
    if (result.isErr) {
      const error = result.asErr;
      const errorString = error.toString();
      
      // Try to parse module error: {"module":{"index":X,"error":"0xYY000000"}}
      let friendlyMessage = null;
      try {
        const errorObj = JSON.parse(errorString);
        if (errorObj.module && errorObj.module.error) {
          const moduleIndex = errorObj.module.index;
          const errorHex = errorObj.module.error;
          const errorCode = parseInt(errorHex.substring(2, 4), 16); // Get first byte after 0x
          
          console.log(`[contractRetry] 🔍 Module error detected: module=${moduleIndex}, errorCode=${errorCode} (0x${errorHex})`);
          
          // Module 52 is the Contracts pallet - these are our contract errors
          if (moduleIndex === 52) {
            // Map error index to user-friendly message (matching contract Error enum order)
            const errorMessages = {
              0: 'CampaignNotFound: Campaign not found',
              1: 'CampaignNotActive: Campaign is not active',
              2: 'GoalReached: Campaign has already reached its funding goal',
              3: 'DeadlinePassed: Campaign deadline has passed',
              4: 'NotCampaignOwner: You are not the owner of this campaign',
              5: 'GoalNotReached: Campaign has not reached its funding goal yet',
              6: 'WithdrawalFailed: Failed to withdraw funds',
              7: 'InvalidDonationAmount: Donation amount is invalid',
              8: 'InvalidTitle: Title must be between 1 and 100 characters',
              9: 'InvalidDescription: Description must be less than 1000 characters',
              10: 'InvalidGoal: Goal must be between 1 and 1,000 DOT',
              11: 'InvalidBeneficiary: Invalid beneficiary address',
              12: 'InvalidDeadline: Deadline must be between 1 hour and 1 year from now',
              13: 'FundsAlreadyWithdrawn: Funds have already been withdrawn',
              14: 'InsufficientFunds: Campaign has insufficient funds for withdrawal',
              15: 'BatchOperationFailed: Batch operation failed',
              16: 'BatchSizeTooLarge: Maximum batch size exceeded',
              17: 'ReentrantCall: Reentrant call detected',
              18: 'CampaignFailed: Campaign is in failed state',
              19: 'NoDonationFound: No donation found for this account',
              20: 'RefundAlreadyClaimed: Refund has already been claimed',
              21: 'TransferFailed: Transfer failed',
              24: 'StorageDepositLimitExhausted: Storage deposit limit exceeded. You may need more funds in your wallet.',
              25: 'StorageDepositNotEnoughFunds: Insufficient funds for storage deposit. Add more tokens to your wallet.',
            };
            
            friendlyMessage = errorMessages[errorCode] || `Contract error (code: ${errorCode})`;
          } else {
            // Error from a different runtime module
            friendlyMessage = `Runtime error from module ${moduleIndex}, error code ${errorCode}`;
          }
          
          console.log(`[contractRetry] Parsed module error: ${friendlyMessage}`);
        }
      } catch (parseError) {
        // If we can't parse as JSON, just log and continue
        console.warn('[contractRetry] Could not parse module error JSON:', parseError.message);
      }
      
      throw new Error(friendlyMessage || errorString);
    }
    
    return { gasRequired, storageDeposit, result };
  };
  
  return retryContractCall(queryFn, options);
};

/**
 * Prepare and return a contract transaction with retry on the query phase
 * @param {Object} contract - The contract instance
 * @param {string} method - The transaction method name
 * @param {string} address - The caller address
 * @param {Array} args - Arguments for the transaction
 * @param {Object} options - Retry options
 * @returns {Promise} - Transaction object
 */
export const prepareContractTransaction = async (
  contract,
  method,
  address,
  args = [],
  options = {}
) => {
  if (!contract) {
    throw new Error('Contract not loaded');
  }
  
  if (!address) {
    throw new Error('Wallet not connected');
  }
  
  // Execute query with retry
  const { gasRequired, storageDeposit } = await executeContractQuery(
    contract,
    method,
    address,
    args,
    options
  );
  
  // Extract the actual storage deposit value if it's wrapped in a Charge object
  let storageLimit = MAX_STORAGE_DEPOSIT_STRING;
  if (storageDeposit) {
    // storageDeposit can be { Charge: value } or { Refund: value }
    if (storageDeposit.asCharge) {
      storageLimit = storageDeposit.asCharge;
    } else if (storageDeposit.isCharge) {
      storageLimit = storageDeposit.asCharge;
    } else {
      // Fallback: use a reasonable default (10 DOT)
      storageLimit = MAX_STORAGE_DEPOSIT_STRING;
    }
  } else {
    // No storage deposit info, use a reasonable default for Paseo
    storageLimit = MAX_STORAGE_DEPOSIT_STRING;
  }

  let cappedStorageLimit = MAX_STORAGE_DEPOSIT_STRING;
  if (storageLimit !== null) {
    try {
      const numericStorage = toBigInt(storageLimit);
      if (numericStorage > CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT) {
        throw new Error(
          `Storage deposit requirement (${numericStorage.toString()} plancks) exceeds cap of ${MAX_STORAGE_DEPOSIT_STRING}.`
        );
      }
      cappedStorageLimit = numericStorage.toString();
    } catch (error) {
      console.warn('[contractRetry] Failed to parse storage limit, using max cap:', error?.message);
      throw error;
    }
  }

  const userSpecifiedTxLimit = options.txOptions?.storageDepositLimit;
  if (userSpecifiedTxLimit !== undefined) {
    try {
      const userLimitBigInt = toBigInt(userSpecifiedTxLimit);
      if (userLimitBigInt > CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT) {
        throw new Error(
          `User-supplied storage deposit limit (${userLimitBigInt.toString()} plancks) exceeds cap of ${MAX_STORAGE_DEPOSIT_STRING}.`
        );
      }
      cappedStorageLimit = userLimitBigInt.toString();
    } catch (error) {
      console.warn('[contractRetry] Failed to parse user storage deposit limit:', error?.message);
      throw error;
    }
  }
  
  console.log('[contractRetry] prepareContractTransaction:', {
    method,
    args,
    gasRequired: gasRequired?.toString(),
    storageDeposit: storageDeposit?.toString(),
    storageLimit: storageLimit?.toString(),
    txOptions: options.txOptions
  });
  
  // Return the transaction object (no retry on tx execution, user must sign)
  const mergedTxOptions = {
    ...options.txOptions,
    storageDepositLimit: cappedStorageLimit,
  };

  const tx = contract.tx[method](
    { gasLimit: gasRequired, ...mergedTxOptions },
    ...args
  );
  
  return tx;
};

/**
 * Default retry options for contract calls
 */
export const defaultRetryOptions = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

export default {
  retryContractCall,
  executeContractQuery,
  prepareContractTransaction,
  defaultRetryOptions,
  isTransientError,
  shouldNotRetry,
};
