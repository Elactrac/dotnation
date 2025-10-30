import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import contractMetadata from '../contracts/donation_platform.json';

/**
 * @typedef {object} ApiContextType
 * @property {ApiPromise | null} api - The Polkadot API instance.
 * @property {ContractPromise | null} contract - The smart contract instance.
 * @property {boolean} isReady - True if the API and contract are ready to be used.
 * @property {string | null} error - An error message if the connection failed.
 */

/**
 * React context for managing the connection to the Polkadot API and smart contract.
 * @type {React.Context<ApiContextType>}
 */
const ApiContext = createContext({});

/**
 * Provider component for the ApiContext.
 * It initializes the Polkadot API and the smart contract, and provides them to its children.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render.
 * @returns {JSX.Element} The API provider component.
 */
export const ApiProvider = ({ children }) => {
  const [api, setApi] = useState(null);
  const [contract, setContract] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let apiInstance = null;

    const initializeApi = async () => {
      try {
        // Connect to configured RPC endpoint
        const rpcEndpoint = import.meta.env.VITE_RPC_ENDPOINT || 'ws://127.0.0.1:9944';
        const wsProvider = new WsProvider(rpcEndpoint);

        console.log(`Connecting to ${rpcEndpoint}...`);

        // Use a shorter timeout and don't block the UI
        apiInstance = await Promise.race([
          ApiPromise.create({ provider: wsProvider }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
        ]);

        await apiInstance.isReady;
        
        if (!isMounted) {
          apiInstance.disconnect();
          return;
        }
        
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
        // Don't block the app - set ready to true anyway so the UI can load
        setIsReady(true);
      }
    };

    // Initialize API asynchronously without blocking
    initializeApi();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (apiInstance) {
        apiInstance.disconnect();
      }
    };
  }, []); // Empty dependency array - only run once on mount

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

/**
 * Custom hook to access the ApiContext.
 * @returns {ApiContextType} The API context value.
 * @throws {Error} If used outside of an ApiProvider.
 */
export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

ApiProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
