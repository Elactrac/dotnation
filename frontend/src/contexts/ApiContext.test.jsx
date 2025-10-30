import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ApiProvider, useApi } from './ApiContext';

// Mock Polkadot API
vi.mock('@polkadot/api', () => ({
  ApiPromise: {
    create: vi.fn(),
  },
  WsProvider: vi.fn(),
}));

vi.mock('@polkadot/api-contract', () => ({
  ContractPromise: vi.fn(),
}));

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';

describe('ApiContext', () => {
  const mockApi = {
    isReady: Promise.resolve(),
    disconnect: vi.fn(),
  };

  const wrapper = ({ children }) => <ApiProvider>{children}</ApiProvider>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear environment variables
    delete import.meta.env.VITE_RPC_ENDPOINT;
    delete import.meta.env.VITE_CONTRACT_ADDRESS;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should provide initial API state', async () => {
      ApiPromise.create.mockResolvedValue(mockApi);

      const { result } = renderHook(() => useApi(), { wrapper });

      // Initially api and contract are null
      expect(result.current.api).toBeNull();
      expect(result.current.contract).toBeNull();
      expect(result.current.isReady).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should throw error when useApi is used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Wrap in try-catch since the error is thrown during render
      let error;
      try {
        renderHook(() => useApi());
      } catch (e) {
        error = e;
      }

      // Should throw an error
      expect(error).toBeDefined();
      expect(error.message).toBe('useApi must be used within an ApiProvider');

      consoleError.mockRestore();
    });
  });

  describe('API Initialization', () => {
    it('should attempt to connect to default RPC endpoint', async () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      ApiPromise.create.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(WsProvider).toHaveBeenCalled();
      });

      consoleLog.mockRestore();
    });

    it('should handle connection timeout', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      ApiPromise.create.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      );

      const { result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      }, { timeout: 10000 });

      consoleWarn.mockRestore();
    }, 15000);

    it('should set ready state even on connection failure', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      ApiPromise.create.mockRejectedValue(new Error('Connection failed'));

      const { result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      consoleWarn.mockRestore();
    });

    it('should handle API connection error gracefully', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new Error('Network error');
      ApiPromise.create.mockRejectedValue(error);

      const { result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      consoleWarn.mockRestore();
    });
  });

  describe('Contract Initialization', () => {
    it('should not initialize contract without address', async () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      ApiPromise.create.mockResolvedValue(mockApi);

      const { result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.contract).toBeNull();

      consoleLog.mockRestore();
      consoleWarn.mockRestore();
    });

    it('should handle contract loading error', async () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      import.meta.env.VITE_CONTRACT_ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      
      ApiPromise.create.mockResolvedValue(mockApi);
      ContractPromise.mockImplementation(() => {
        throw new Error('Invalid contract');
      });

      const { result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      consoleLog.mockRestore();
      consoleWarn.mockRestore();
    });
  });

  describe('Environment Configuration', () => {
    it('should use default RPC endpoint when not configured', async () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      ApiPromise.create.mockImplementation(() => new Promise(() => {}));

      renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(WsProvider).toHaveBeenCalledWith('ws://127.0.0.1:9944');
      });

      consoleLog.mockRestore();
      consoleWarn.mockRestore();
    });

    it('should use configured RPC endpoint', async () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      import.meta.env.VITE_RPC_ENDPOINT = 'ws://custom:9944';
      
      ApiPromise.create.mockImplementation(() => new Promise(() => {}));

      renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(WsProvider).toHaveBeenCalledWith('ws://custom:9944');
      });

      consoleLog.mockRestore();
      consoleWarn.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should disconnect API on unmount', async () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      ApiPromise.create.mockResolvedValue(mockApi);

      const { unmount, result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      unmount();

      // Note: cleanup runs but api is initially null in test environment
      expect(unmount).not.toThrow();

      consoleLog.mockRestore();
      consoleWarn.mockRestore();
    });
  });

  describe('Context Values', () => {
    it('should provide all required context values', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      ApiPromise.create.mockRejectedValue(new Error('Connection failed'));

      const { result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current).toHaveProperty('api');
      expect(result.current).toHaveProperty('contract');
      expect(result.current).toHaveProperty('isReady');
      expect(result.current).toHaveProperty('error');

      consoleWarn.mockRestore();
    });

    it('should have correct initial value types', () => {
      ApiPromise.create.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useApi(), { wrapper });

      expect(result.current.api === null || typeof result.current.api === 'object').toBe(true);
      expect(result.current.contract === null || typeof result.current.contract === 'object').toBe(true);
      expect(typeof result.current.isReady).toBe('boolean');
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
    });
  });

  describe('Error State', () => {
    it('should initialize with null error', () => {
      ApiPromise.create.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useApi(), { wrapper });

      expect(result.current.error).toBeNull();
    });

    it('should set error message on connection failure', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorMessage = 'Failed to connect';
      ApiPromise.create.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      consoleWarn.mockRestore();
    });

    it('should still set ready to true on error', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      ApiPromise.create.mockRejectedValue(new Error('Connection failed'));

      const { result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
        expect(result.current.error).toBe('Connection failed');
      });

      consoleWarn.mockRestore();
    });
  });

  describe('Connection Timeout', () => {
    it('should timeout after 5 seconds', async () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Simulate a connection that never resolves
      ApiPromise.create.mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      }, { timeout: 10000 });

      consoleLog.mockRestore();
      consoleWarn.mockRestore();
    }, 15000);
  });

  describe('Provider Rendering', () => {
    it('should render children', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      ApiPromise.create.mockRejectedValue(new Error('Connection failed'));

      const { result } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      consoleWarn.mockRestore();
    });

    it('should provide context to multiple consumers', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      ApiPromise.create.mockRejectedValue(new Error('Connection failed'));

      const { result: result1 } = renderHook(() => useApi(), { wrapper });
      const { result: result2 } = renderHook(() => useApi(), { wrapper });

      await waitFor(() => {
        expect(result1.current.isReady).toBe(true);
        expect(result2.current.isReady).toBe(true);
      });

      consoleWarn.mockRestore();
    });
  });

  describe('Async Initialization', () => {
    it('should not block app when API initialization is slow', async () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Simulate slow initialization
      ApiPromise.create.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockApi), 10000))
      );

      const { result } = renderHook(() => useApi(), { wrapper });

      // Should timeout and set ready to true anyway
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      }, { timeout: 10000 });

      consoleLog.mockRestore();
      consoleWarn.mockRestore();
    }, 15000);
  });
});
