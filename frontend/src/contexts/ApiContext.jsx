import React, { createContext, useState, useContext, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import contractMetadata from '../contracts/donation_platform.json';

const ApiContext = createContext({});

export const ApiProvider = ({ children }) => {
  const [api, setApi] = useState(null);
  const [contract, setContract] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApi = async () => {
      try {
        // Connect to configured RPC endpoint
        const rpcEndpoint = import.meta.env.VITE_RPC_ENDPOINT || 'ws://127.0.0.1:9944';
        const wsProvider = new WsProvider(rpcEndpoint);

        console.log(`Connecting to ${rpcEndpoint}...`);

        const apiInstance = await Promise.race([
          ApiPromise.create({ provider: wsProvider }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000))
        ]);

        await apiInstance.isReady;
        setApi(apiInstance);

        // Initialize contract if address is provided
        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
        if (contractAddress) {
          try {
            const contractInstance = new ContractPromise(apiInstance, contractMetadata, contractAddress);
            setContract(contractInstance);
            console.log(`Contract loaded at ${contractAddress}`);
          } catch (contractErr) {
            console.warn('Failed to load contract:', contractErr.message);
          }
        }

        setIsReady(true);

        console.log(`API connected successfully to ${rpcEndpoint}`);
      } catch (err) {
        console.warn('API connection failed:', err.message);
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
        contract,
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
