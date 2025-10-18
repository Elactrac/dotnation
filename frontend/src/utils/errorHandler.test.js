/**
 * Test suite for errorHandler utility functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ChainError,
  ErrorCodes,
  retryWithBackoff,
  parseBlockchainError,
  formatErrorForUser,
  safePromise,
} from './errorHandler.js';

describe('ChainError', () => {
  it('should create error with code and details', () => {
    const error = new ChainError(
      'Test error',
      ErrorCodes.CONNECTION_FAILED,
      { extra: 'data' }
    );

    expect(error.message).toBe('Test error');
    expect(error.code).toBe(ErrorCodes.CONNECTION_FAILED);
    expect(error.details).toEqual({ extra: 'data' });
    expect(error.timestamp).toBeDefined();
  });

  it('should serialize to JSON', () => {
    const error = new ChainError('Test', ErrorCodes.TX_FAILED);
    const json = error.toJSON();

    expect(json.name).toBe('ChainError');
    expect(json.message).toBe('Test');
    expect(json.code).toBe(ErrorCodes.TX_FAILED);
  });
});

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should succeed on first try', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, { maxRetries: 3, initialDelay: 100 });

    // Fast-forward time for each retry
    await vi.advanceTimersByTimeAsync(100); // First retry
    await vi.advanceTimersByTimeAsync(200); // Second retry

    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));

    const promise = retryWithBackoff(fn, { maxRetries: 2, initialDelay: 10 });
    promise.catch(() => {}); // Suppress unhandled rejection warning

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('always fails');

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry certain errors', async () => {
    const error = new ChainError('Invalid input', ErrorCodes.INVALID_INPUT);
    const fn = vi.fn().mockRejectedValue(error);

    await expect(
      retryWithBackoff(fn, { maxRetries: 3 })
    ).rejects.toThrow('Invalid input');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, {
      maxRetries: 2,
      initialDelay: 10,
      onRetry,
    });

    await vi.runAllTimersAsync();

    await promise;

    expect(onRetry).toHaveBeenCalledWith(1, 2, 10, expect.any(Error));
  });
});

describe('parseBlockchainError', () => {
  it('should parse timeout errors', () => {
    const error = new Error('Connection timeout after 5000ms');
    const chainError = parseBlockchainError(error);

    expect(chainError.code).toBe(ErrorCodes.CONNECTION_TIMEOUT);
    expect(chainError.message).toContain('timeout');
  });

  it('should parse disconnection errors', () => {
    const error = new Error('WebSocket disconnected');
    const chainError = parseBlockchainError(error);

    expect(chainError.code).toBe(ErrorCodes.DISCONNECTED);
  });

  it('should parse insufficient balance errors', () => {
    const error = new Error('Insufficient balance to pay fees');
    const chainError = parseBlockchainError(error);

    expect(chainError.code).toBe(ErrorCodes.INSUFFICIENT_BALANCE);
  });

  it('should parse rejection errors', () => {
    const error = new Error('Transaction rejected by user');
    const chainError = parseBlockchainError(error);

    expect(chainError.code).toBe(ErrorCodes.TX_REJECTED);
  });

  it('should handle unknown errors', () => {
    const error = new Error('Some random error');
    const chainError = parseBlockchainError(error);

    expect(chainError.code).toBe(ErrorCodes.UNKNOWN_ERROR);
    expect(chainError.message).toBe('Some random error');
  });
});

describe('formatErrorForUser', () => {
  it('should format ChainError', () => {
    const error = new ChainError('Test error', ErrorCodes.TX_FAILED);
    const formatted = formatErrorForUser(error);

    expect(formatted).toBe('Test error');
  });

  it('should format Polkadot.js invalid transaction error', () => {
    const error = new Error('1010: Invalid Transaction: Inability to pay some fees');
    const formatted = formatErrorForUser(error);

    expect(formatted).toBe('Insufficient balance to pay transaction fees.');
  });

  it('should format no extension error', () => {
    const error = new Error('No extension found');
    const formatted = formatErrorForUser(error);

    expect(formatted).toContain('extension');
  });

  it('should format no accounts error', () => {
    const error = new Error('No accounts found in wallet');
    const formatted = formatErrorForUser(error);

    expect(formatted).toContain('No accounts');
  });

  it('should provide generic message for unknown errors', () => {
    const error = new Error('Something weird happened');
    const formatted = formatErrorForUser(error);

    expect(formatted).toBe('An unexpected error occurred. Please try again.');
  });
});

describe('safePromise', () => {
  it('should return data on success', async () => {
    const promise = Promise.resolve('data');
    const result = await safePromise(promise);

    expect(result).toEqual({ data: 'data', error: null });
  });

  it('should return error on failure', async () => {
    const promise = Promise.reject(new Error('fail'));
    const result = await safePromise(promise);

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(ChainError);
  });
});
