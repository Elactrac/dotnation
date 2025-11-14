import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  retryContractCall,
  executeContractQuery,
  prepareContractTransaction,
  isTransientError,
  shouldNotRetry,
  defaultRetryOptions,
} from './contractRetry';
import { ErrorCodes } from './errorHandler';

describe('contractRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('isTransientError', () => {
    it('should identify timeout errors as transient', () => {
      const error = new Error('Connection timeout');
      expect(isTransientError(error)).toBe(true);
    });

    it('should identify network errors as transient', () => {
      const error = new Error('Network error occurred');
      expect(isTransientError(error)).toBe(true);
    });

    it('should identify connection errors as transient', () => {
      const error = new Error('Connection failed');
      expect(isTransientError(error)).toBe(true);
    });

    it('should identify rate limit errors as transient', () => {
      const error = new Error('Too many requests - rate limit exceeded');
      expect(isTransientError(error)).toBe(true);
    });

    it('should not identify validation errors as transient', () => {
      const error = new Error('Invalid campaign ID');
      expect(isTransientError(error)).toBe(false);
    });

    it('should identify errors by error code', () => {
      const error = { code: ErrorCodes.CONNECTION_TIMEOUT, message: 'Timeout' };
      expect(isTransientError(error)).toBe(true);
    });
  });

  describe('shouldNotRetry', () => {
    it('should not retry wallet not connected errors', () => {
      const error = new Error('Wallet not connected');
      expect(shouldNotRetry(error)).toBe(true);
    });

    it('should not retry transaction rejected errors', () => {
      const error = new Error('Transaction rejected by user');
      expect(shouldNotRetry(error)).toBe(true);
    });

    it('should not retry invalid input errors', () => {
      const error = new Error('Invalid campaign title');
      expect(shouldNotRetry(error)).toBe(true);
    });

    it('should not retry "not found" errors', () => {
      const error = new Error('Campaign not found');
      expect(shouldNotRetry(error)).toBe(true);
    });

    it('should not retry "already claimed" errors', () => {
      const error = new Error('Refund already claimed');
      expect(shouldNotRetry(error)).toBe(true);
    });

    it('should not retry "not active" errors', () => {
      const error = new Error('Campaign is not active');
      expect(shouldNotRetry(error)).toBe(true);
    });

    it('should not retry by error code', () => {
      const error = { code: ErrorCodes.TX_REJECTED, message: 'Rejected' };
      expect(shouldNotRetry(error)).toBe(true);
    });

    it('should allow retry for other errors', () => {
      const error = new Error('Some random network issue');
      expect(shouldNotRetry(error)).toBe(false);
    });
  });

  describe('retryContractCall', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await retryContractCall(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on transient errors', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const onRetry = vi.fn();

      const promise = retryContractCall(mockFn, {
        maxRetries: 3,
        initialDelay: 100,
        onRetry,
      });

      // Fast-forward through the delays
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);

      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Transaction rejected by user'));

      await expect(retryContractCall(mockFn)).rejects.toThrow('Transaction rejected by user');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on non-transient errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Invalid campaign ID'));

      await expect(retryContractCall(mockFn)).rejects.toThrow('Invalid campaign ID');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throw last error after max retries', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Connection timeout'));

      const promise = retryContractCall(mockFn, {
        maxRetries: 3,
        initialDelay: 100,
      });

      // Fast-forward through all delays
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);

      await expect(promise).rejects.toThrow('Connection timeout');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Timeout'));
      const onRetry = vi.fn();

      const promise = retryContractCall(mockFn, {
        maxRetries: 3,
        initialDelay: 100,
        backoffFactor: 2,
        onRetry,
      });

      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);

      await expect(promise).rejects.toThrow();

      // Check that delays follow exponential backoff
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, 3, 100, expect.any(Error));
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, 3, 200, expect.any(Error));
    });

    it('should respect maxDelay cap', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Timeout'));
      const onRetry = vi.fn();

      const promise = retryContractCall(mockFn, {
        maxRetries: 5,
        initialDelay: 1000,
        maxDelay: 3000,
        backoffFactor: 3,
        onRetry,
      });

      await vi.advanceTimersByTimeAsync(1000); // 1st retry
      await vi.advanceTimersByTimeAsync(3000); // 2nd retry (capped at maxDelay)
      await vi.advanceTimersByTimeAsync(3000); // 3rd retry (capped)
      await vi.advanceTimersByTimeAsync(3000); // 4th retry (capped)

      await expect(promise).rejects.toThrow();

      // Verify delays are capped at maxDelay
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, 5, 1000, expect.any(Error));
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, 5, 3000, expect.any(Error));
      expect(onRetry).toHaveBeenNthCalledWith(3, 3, 5, 3000, expect.any(Error));
      expect(onRetry).toHaveBeenNthCalledWith(4, 4, 5, 3000, expect.any(Error));
    });
  });

  describe('executeContractQuery', () => {
    it('should throw error when contract is not provided', async () => {
      await expect(
        executeContractQuery(null, 'someMethod', 'address')
      ).rejects.toThrow('Contract not loaded');
    });

    it('should throw error when address is not provided', async () => {
      const mockContract = { query: {} };
      await expect(
        executeContractQuery(mockContract, 'someMethod', '')
      ).rejects.toThrow('Wallet not connected');
    });

    it('should execute contract query successfully', async () => {
      const mockContract = {
        query: {
          testMethod: vi.fn().mockResolvedValue({
            gasRequired: '1000',
            storageDeposit: '500',
            result: { isErr: false },
          }),
        },
      };

      const result = await executeContractQuery(
        mockContract,
        'testMethod',
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        ['arg1', 'arg2']
      );

      expect(result.gasRequired).toBe('1000');
      expect(result.storageDeposit).toBe('500');
      expect(mockContract.query.testMethod).toHaveBeenCalledWith(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1, storageDepositLimit: null },
        'arg1',
        'arg2'
      );
    });

    it('should throw error when contract query returns error', async () => {
      const mockContract = {
        query: {
          testMethod: vi.fn().mockResolvedValue({
            result: {
              isErr: true,
              asErr: { toString: () => 'CampaignNotActive' },
            },
          }),
        },
      };

      await expect(
        executeContractQuery(
          mockContract,
          'testMethod',
          '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
        )
      ).rejects.toThrow('CampaignNotActive');
    });

    it('should retry on transient errors', async () => {
      const mockContract = {
        query: {
          testMethod: vi
            .fn()
            .mockRejectedValueOnce(new Error('Network timeout'))
            .mockResolvedValue({
              gasRequired: '1000',
              storageDeposit: '500',
              result: { isErr: false },
            }),
        },
      };

      const promise = executeContractQuery(
        mockContract,
        'testMethod',
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
      );

      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;
      expect(result.gasRequired).toBe('1000');
      expect(mockContract.query.testMethod).toHaveBeenCalledTimes(2);
    });
  });

  describe('prepareContractTransaction', () => {
    it('should prepare transaction successfully', async () => {
      const mockTx = { signAndSend: vi.fn() };
      const mockContract = {
        query: {
          testMethod: vi.fn().mockResolvedValue({
            gasRequired: '1000',
            storageDeposit: '500',
            result: { isErr: false },
          }),
        },
        tx: {
          testMethod: vi.fn().mockReturnValue(mockTx),
        },
      };

      const tx = await prepareContractTransaction(
        mockContract,
        'testMethod',
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        ['arg1']
      );

      expect(tx).toBe(mockTx);
      expect(mockContract.query.testMethod).toHaveBeenCalled();
      expect(mockContract.tx.testMethod).toHaveBeenCalledWith(
        { gasLimit: '1000', storageDepositLimit: '500' },
        'arg1'
      );
    });

    it('should pass custom query and tx options', async () => {
      const mockTx = { signAndSend: vi.fn() };
      const mockContract = {
        query: {
          donate: vi.fn().mockResolvedValue({
            gasRequired: '2000',
            storageDeposit: '1000',
            result: { isErr: false },
          }),
        },
        tx: {
          donate: vi.fn().mockReturnValue(mockTx),
        },
      };

      const tx = await prepareContractTransaction(
        mockContract,
        'donate',
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        [1],
        {
          queryOptions: { value: 1000000n },
          txOptions: { value: 1000000n },
        }
      );

      expect(tx).toBe(mockTx);
      expect(mockContract.query.donate).toHaveBeenCalledWith(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1, storageDepositLimit: null, value: 1000000n },
        1
      );
      expect(mockContract.tx.donate).toHaveBeenCalledWith(
        { gasLimit: '2000', storageDepositLimit: '1000', value: 1000000n },
        1
      );
    });
  });

  describe('defaultRetryOptions', () => {
    it('should have correct default values', () => {
      expect(defaultRetryOptions.maxRetries).toBe(3);
      expect(defaultRetryOptions.initialDelay).toBe(1000);
      expect(defaultRetryOptions.maxDelay).toBe(10000);
      expect(defaultRetryOptions.backoffFactor).toBe(2);
    });
  });
});
