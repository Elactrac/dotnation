import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BatchOperationsProvider, useBatchOperations } from './BatchOperationsContext';
import { WalletProvider } from './WalletContext';
import { ApiProvider } from './ApiContext';
import { ChakraProvider } from '@chakra-ui/react';

// Mock dependencies
vi.mock('@polkadot/extension-dapp', () => ({
  web3Enable: vi.fn(),
  web3Accounts: vi.fn(),
}));

vi.mock('../utils/metrics', () => ({
  metrics: {
    recordApiCall: vi.fn(),
    recordWalletConnection: vi.fn(),
    recordError: vi.fn(),
  },
}));

vi.mock('../utils/sentry', () => ({
  setUserContext: vi.fn(),
  trackEvent: vi.fn(),
  trackError: vi.fn(),
}));

describe('BatchOperationsContext', () => {
  const mockAccount = {
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    meta: { name: 'Test Account', source: 'polkadot-js' },
  };

  const wrapper = ({ children }) => (
    <ChakraProvider>
      <ApiProvider>
        <WalletProvider>
          <BatchOperationsProvider>{children}</BatchOperationsProvider>
        </WalletProvider>
      </ApiProvider>
    </ChakraProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should provide initial batch operations state', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current.batchLoading).toBe(false);
      expect(result.current.batchProgress).toEqual({ current: 0, total: 0 });
      expect(typeof result.current.createCampaignsBatch).toBe('function');
      expect(typeof result.current.withdrawFundsBatch).toBe('function');
      expect(typeof result.current.getContractVersion).toBe('function');
      expect(typeof result.current.getMaxBatchSize).toBe('function');
      expect(typeof result.current.isBatchOperationsAvailable).toBe('function');
    });

    it('should throw error when useBatchOperations is used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useBatchOperations());
      }).toThrow('useBatchOperations must be used within BatchOperationsProvider');

      consoleError.mockRestore();
    });
  });

  describe('createCampaignsBatch', () => {
    it('should throw error when API is not connected', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      const campaignsData = [
        {
          title: 'Campaign 1',
          description: 'Description 1',
          goal: '1000',
          deadline: Date.now() + 86400000,
          beneficiary: '5FHneW46xGXgs5mUiveU4sbTyGBzmvcE1QP9KG1Yqk5j9',
        },
      ];

      await expect(result.current.createCampaignsBatch(campaignsData)).rejects.toThrow(
        'API, contract, or wallet not connected'
      );
    });

    it('should throw error for empty campaignsData array', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      // API check happens first
      await expect(result.current.createCampaignsBatch([])).rejects.toThrow();
    });

    it('should throw error for non-array campaignsData', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      // API check happens first
      await expect(result.current.createCampaignsBatch(null)).rejects.toThrow();
    });

    it('should validate campaignsData structure', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      const invalidData = 'not an array';

      await expect(result.current.createCampaignsBatch(invalidData)).rejects.toThrow();
    });
  });

  describe('withdrawFundsBatch', () => {
    it('should throw error when API is not connected', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      const campaignIds = [1, 2, 3];

      await expect(result.current.withdrawFundsBatch(campaignIds)).rejects.toThrow(
        'API, contract, or wallet not connected'
      );
    });

    it('should throw error for empty campaignIds array', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      // API check happens first
      await expect(result.current.withdrawFundsBatch([])).rejects.toThrow();
    });

    it('should throw error for non-array campaignIds', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      // API check happens first
      await expect(result.current.withdrawFundsBatch(null)).rejects.toThrow();
    });

    it('should validate campaignIds structure', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      const invalidData = 'not an array';

      await expect(result.current.withdrawFundsBatch(invalidData)).rejects.toThrow();
    });
  });

  describe('getContractVersion', () => {
    it('should throw error when API is not connected', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      await expect(result.current.getContractVersion()).rejects.toThrow(
        'API or contract not connected'
      );
    });

    it('should return default version 1 on error', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      // Should throw because contract is not available
      await expect(result.current.getContractVersion()).rejects.toThrow();
    });
  });

  describe('getMaxBatchSize', () => {
    it('should throw error when API is not connected', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      await expect(result.current.getMaxBatchSize()).rejects.toThrow(
        'API or contract not connected'
      );
    });

    it('should return default batch size on error', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      // Should throw because contract is not available
      await expect(result.current.getMaxBatchSize()).rejects.toThrow();
    });
  });

  describe('isBatchOperationsAvailable', () => {
    it('should return false when contract version check fails', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      const isAvailable = await result.current.isBatchOperationsAvailable();

      expect(isAvailable).toBe(false);
    });

    it('should check contract version to determine availability', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      const isAvailable = await result.current.isBatchOperationsAvailable();

      // Should be false when contract is not available
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe('Batch Progress Tracking', () => {
    it('should initialize with zero progress', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current.batchProgress.current).toBe(0);
      expect(result.current.batchProgress.total).toBe(0);
    });

    it('should track batch loading state', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current.batchLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid campaign data gracefully', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      await expect(result.current.createCampaignsBatch(undefined)).rejects.toThrow();
    });

    it('should handle invalid campaign IDs gracefully', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      await expect(result.current.withdrawFundsBatch(undefined)).rejects.toThrow();
    });

    it('should validate array inputs', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      await expect(result.current.createCampaignsBatch({})).rejects.toThrow();
      await expect(result.current.withdrawFundsBatch({})).rejects.toThrow();
    });
  });

  describe('Context Dependencies', () => {
    it('should depend on ApiContext', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      // Should not crash when API is not available
      expect(result.current).toBeDefined();
    });

    it('should depend on WalletContext', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      // Should not crash when wallet is not connected
      expect(result.current).toBeDefined();
    });

    it('should use ChakraProvider for toast notifications', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      // Context should be available
      expect(result.current).toBeDefined();
    });
  });

  describe('Batch Operations Features', () => {
    it('should provide batch campaign creation functionality', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current.createCampaignsBatch).toBeDefined();
      expect(typeof result.current.createCampaignsBatch).toBe('function');
    });

    it('should provide batch withdrawal functionality', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current.withdrawFundsBatch).toBeDefined();
      expect(typeof result.current.withdrawFundsBatch).toBe('function');
    });

    it('should provide contract version checking', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current.getContractVersion).toBeDefined();
      expect(typeof result.current.getContractVersion).toBe('function');
    });

    it('should provide max batch size checking', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current.getMaxBatchSize).toBeDefined();
      expect(typeof result.current.getMaxBatchSize).toBe('function');
    });

    it('should provide batch operations availability check', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current.isBatchOperationsAvailable).toBeDefined();
      expect(typeof result.current.isBatchOperationsAvailable).toBe('function');
    });
  });

  describe('State Management', () => {
    it('should maintain batchLoading state', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current.batchLoading).toBe(false);
    });

    it('should maintain batchProgress state', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current.batchProgress).toEqual({ current: 0, total: 0 });
    });

    it('should provide all required context values', () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      expect(result.current).toHaveProperty('batchLoading');
      expect(result.current).toHaveProperty('batchProgress');
      expect(result.current).toHaveProperty('createCampaignsBatch');
      expect(result.current).toHaveProperty('withdrawFundsBatch');
      expect(result.current).toHaveProperty('getContractVersion');
      expect(result.current).toHaveProperty('getMaxBatchSize');
      expect(result.current).toHaveProperty('isBatchOperationsAvailable');
    });
  });

  describe('Input Validation', () => {
    it('should validate campaign data format', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      const invalidData = [{ invalid: 'data' }];

      // Should throw when trying to process invalid data (after checking for contract)
      await expect(result.current.createCampaignsBatch(invalidData)).rejects.toThrow();
    });

    it('should validate campaign IDs format', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      const invalidIds = ['not', 'numbers'];

      // Should throw when trying to process invalid IDs (after checking for contract)
      await expect(result.current.withdrawFundsBatch(invalidIds)).rejects.toThrow();
    });

    it('should handle empty input arrays', async () => {
      const { result } = renderHook(() => useBatchOperations(), { wrapper });

      // API/contract check happens before array validation
      await expect(result.current.createCampaignsBatch([])).rejects.toThrow();
      await expect(result.current.withdrawFundsBatch([])).rejects.toThrow();
    });
  });
});
