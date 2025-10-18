import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { retryWithBackoff, ChainError, ErrorCodes } from '../utils/errorHandler';

const ApiContext = createContext({});

export const ApiProvider = ({ children }) => {
  const [api, setApi] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connectToNode = useCallback(async (wsEndpoint = 'ws://127.0.0.1:9944') => {
    setIsConnecting(true);
    setError(null);

    try {
      const wsProvider = new WsProvider(wsEndpoint);
      
      // Add connection event listeners
      wsProvider.on('connected', () => {
        console.log('WebSocket connected to', wsEndpoint);
      });
      
      wsProvider.on('disconnected', () => {
        console.warn('WebSocket disconnected');
        setIsReady(false);
        // Attempt to reconnect
        if (reconnectAttempts < 3) {
          setReconnectAttempts(prev => prev + 1);
          setTimeout(() => connectToNode(wsEndpoint), 5000);
        }
      });
      
      wsProvider.on('error', (error) => {
        console.error('WebSocket error:', error);
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
            console.log(`Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);
          }
        }
      );
      
      await apiInstance.isReady;
      setApi(apiInstance);
      setIsReady(true);
      setReconnectAttempts(0);
      
      console.log('API connected successfully to', wsEndpoint);
      
      return apiInstance;
    } catch (err) {
      console.warn('API connection failed (app will work without node):', err.message);
      const chainError = new ChainError(
        'Failed to connect to blockchain node',
        ErrorCodes.CONNECTION_FAILED,
        { originalError: err.message, endpoint: wsEndpoint }
      );
      setError(chainError);
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
      if (api) {
        api.disconnect();
      }
    };
  }, [connectToNode, api]);

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
