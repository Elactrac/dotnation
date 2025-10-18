import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { retryWithBackoff, ChainError, ErrorCodes } from '../utils/errorHandler';
import { metrics } from '../utils/metrics';
import { ContractEventMonitor } from '../utils/eventMonitor';
import { loggers } from '../utils/logger';

const ApiContext = createContext({});

export const ApiProvider = ({ children }) => {
  const [api, setApi] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [eventMonitor, setEventMonitor] = useState(null);

  const connectToNode = useCallback(async (wsEndpoint = 'ws://127.0.0.1:9944') => {
    const startTime = Date.now();
    setIsConnecting(true);
    setError(null);

    loggers.api.info('Connecting to blockchain node', { wsEndpoint });

    try {
      const wsProvider = new WsProvider(wsEndpoint);
      
      // Add connection event listeners
      wsProvider.on('connected', () => {
        loggers.api.info('WebSocket connected successfully', { wsEndpoint });
      });

      wsProvider.on('disconnected', () => {
        loggers.api.warn('WebSocket disconnected, attempting reconnection', {
          wsEndpoint,
          reconnectAttempts
        });
        setIsReady(false);
        // Attempt to reconnect
        if (reconnectAttempts < 3) {
          setReconnectAttempts(prev => prev + 1);
          setTimeout(() => connectToNode(wsEndpoint), 5000);
        }
      });

      wsProvider.on('error', (error) => {
        loggers.api.error('WebSocket connection error', { wsEndpoint }, error);
        setError(new ChainError(
          'Connection error occurred',
          ErrorCodes.CONNECTION_FAILED,
          { error: error.message }
        ));
      });

      // Connect with retry logic and timeout
      const apiInstance = await retryWithBackoff(
        async () => {
          return await Promise.race([
            ApiPromise.create({ provider: wsProvider }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Connection timeout')), 5000)
            )
          ]);
        },
        {
          maxRetries: 3,
          initialDelay: 2000,
          onRetry: (attempt, maxRetries, delay) => {
            loggers.api.warn(`Connection retry attempt ${attempt}/${maxRetries} in ${delay}ms`, {
              wsEndpoint,
              attempt,
              maxRetries,
              delay
            });
          }
        }
      );
      
      await apiInstance.isReady;
      setApi(apiInstance);
      setIsReady(true);
      setReconnectAttempts(0);

      // Record successful connection metrics
      metrics.recordApiCall('connectToNode', Date.now() - startTime, true);

      // Initialize event monitor for contract events
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (contractAddress) {
        const monitor = new ContractEventMonitor(apiInstance, contractAddress);
        setEventMonitor(monitor);

        // Start monitoring events
        monitor.start((event) => {
          loggers.api.info('Contract event received', { event });
          // Could emit custom events or update state based on events
        });
      }

      loggers.api.info('API connected successfully', {
        wsEndpoint,
        duration: Date.now() - startTime
      });
      
      return apiInstance;
    } catch (err) {
      loggers.api.warn('API connection failed (app will work without node)', {
        wsEndpoint,
        error: err.message,
        duration: Date.now() - startTime
      }, err);

      const chainError = new ChainError(
        'Failed to connect to blockchain node',
        ErrorCodes.CONNECTION_FAILED,
        { originalError: err.message, endpoint: wsEndpoint }
      );
      setError(chainError);

      // Record failed connection metrics
      metrics.recordApiCall('connectToNode', Date.now() - startTime, false);
      metrics.recordError(chainError, 'error', { operation: 'connectToNode', endpoint: wsEndpoint });

      // Don't block the app, continue anyway
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [reconnectAttempts]);

  useEffect(() => {
    const wsEndpoint = import.meta.env.VITE_RPC_ENDPOINT || 'ws://127.0.0.1:9944';
    connectToNode(wsEndpoint);

    // Cleanup on unmount
    return () => {
      if (eventMonitor) {
        eventMonitor.stop();
      }
      if (api) {
        api.disconnect();
      }
    };
  }, [connectToNode, api, eventMonitor]);

  const retryConnection = useCallback(() => {
    setReconnectAttempts(0);
    const wsEndpoint = import.meta.env.VITE_RPC_ENDPOINT || 'ws://127.0.0.1:9944';
    connectToNode(wsEndpoint);
  }, [connectToNode]);

  return (
    <ApiContext.Provider
      value={{
        api,
        isReady,
        error,
        isConnecting,
        reconnectAttempts,
        retryConnection,
        eventMonitor,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

ApiProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
