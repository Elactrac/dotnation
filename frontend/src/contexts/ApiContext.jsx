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

        console.log('[ApiContext] Connecting to', rpcEndpoint);

        // Use a longer timeout for remote endpoints (Mandala can be slow)
        apiInstance = await Promise.race([
          ApiPromise.create({ provider: wsProvider }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 15000))
        ]);

        await apiInstance.isReady;
        
        if (!isMounted) {
          apiInstance.disconnect();
          return;
        }
        
        setApi(apiInstance);
        console.log('[ApiContext] ✅ API connected successfully to', rpcEndpoint);

        // Initialize contract if address is provided
        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
        console.log('[ApiContext] Contract address from env:', contractAddress);
        
        if (contractAddress) {
          try {
            const contractInstance = new ContractPromise(apiInstance, contractMetadata, contractAddress);
            setContract(contractInstance);
            console.log('[ApiContext] ✅ Contract loaded at', contractAddress);
          } catch (contractErr) {
            console.error('[ApiContext] ❌ Failed to load contract:', contractErr.message);
            console.error('[ApiContext] Contract error details:', contractErr);
          }
        } else {
          console.warn('[ApiContext] ⚠️  No contract address configured (VITE_CONTRACT_ADDRESS is empty)');
        }

        setIsReady(true);

        console.log('[ApiContext] ✅ Initialization complete');
      } catch (err) {
        console.error('[ApiContext] ❌ API connection failed:', err.message);
        console.error('[ApiContext] Error details:', err);
        setError(err.message);
        // Don't block the app - set ready to true anyway so the UI can load
        setIsReady(true);
        console.log('[ApiContext] ⚠️  App will continue in mock mode');
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
 * Helper function to create proper gas limit for contract queries
 * Note: gasLimit: -1 causes ContractTrapped errors on some chains (e.g., Mandala/Paseo)
 * 
 * IMPORTANT: Previous values (30B refTime, 5MB proofSize) were causing "Transaction would 
 * exhaust the block limits" errors. Reduced to conservative values that fit within typical
 * Substrate block limits while still allowing complex operations.
 * 
 * @param {ApiPromise} api - The Polkadot API instance
 * @returns {object} Proper WeightV2 gas limit
 */
export const createGasLimit = (api) => {
  if (!api || !api.registry) {
    // Fallback for when API is not ready
    return { refTime: 3000000000, proofSize: 1048576 };
  }
  // Create proper WeightV2 gas limit
  // refTime: 3 billion (reduced from 30 billion) - sufficient for most contract operations
  // proofSize: 1MB (reduced from 5MB) - typical contract state proof size
  return api.registry.createType('WeightV2', {
    refTime: 3000000000,   // 3 billion gas units for computation (10x reduction)
    proofSize: 1048576     // 1MB proof size (5x reduction)
  });
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
