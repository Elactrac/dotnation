import React, { createContext, useState, useContext, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

const ApiContext = createContext({});

export const ApiProvider = ({ children }) => {
  const [api, setApi] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApi = async () => {
      try {
        // Try to connect to local Substrate node (optional, with timeout)
        const wsProvider = new WsProvider('ws://127.0.0.1:9944');
        const apiInstance = await Promise.race([
          ApiPromise.create({ provider: wsProvider }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
        ]);
        
        await apiInstance.isReady;
        setApi(apiInstance);
        setIsReady(true);
        
        console.log('API connected successfully');
      } catch (err) {
        console.warn('API connection failed (app will work without node):', err.message);
        setError(err.message);
        // Don't block the app, continue anyway
      }
    };

    initializeApi();

    // Cleanup on unmount
    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  return (
    <ApiContext.Provider
      value={{
        api,
        isReady,
        error,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
