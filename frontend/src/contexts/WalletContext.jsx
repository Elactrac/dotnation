import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { metrics } from '../utils/metrics';
import { setUserContext, trackEvent, trackError } from '../utils/sentry';
import { useApi } from './ApiContext';

export const WalletContext = createContext({});

/**
 * Provides wallet-related state and functions to the application.
 *
 * This provider manages the connection to the user's Polkadot wallet,
 * fetching accounts, handling account switching, and disconnecting. It also
 * retrieves the balance of the selected account.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components that will have
 *   access to the wallet context.
 * @returns {JSX.Element} The WalletProvider component.
 */
export const WalletProvider = ({ children }) => {
  const { api, isReady: isApiReady } = useApi();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const getBalance = async () => {
      if (!selectedAccount) {
        setBalance(null);
        return;
      }

      if (api && isApiReady) {
        const startTime = Date.now();
        try {
          const { data: { free: balance } } = await api.query.system.account(selectedAccount.address);
          setBalance(balance.toString());
          metrics.recordApiCall('getBalance', Date.now() - startTime, true);
        } catch (err) {
          console.error('Failed to get Polkadot balance:', err);
          metrics.recordApiCall('getBalance', Date.now() - startTime, false);
          metrics.recordError(err, 'error', { operation: 'getBalance' });
        }
      } else {
        setBalance(null);
      }
    };

    getBalance();
  }, [api, selectedAccount, isApiReady]);

  const connectWallet = async () => {
    const startTime = Date.now();

    try {
      // Add retry logic for extension connection
      let extensions = [];
      let lastError = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempting to connect to Polkadot.js extension (attempt ${attempt}/${maxRetries})...`);
          
          // Wait a bit between retries to allow extension to initialize
          if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
          }
          
          extensions = await web3Enable('DotNation');
          
          if (extensions.length > 0) {
            console.log(`Successfully connected to Polkadot.js extension on attempt ${attempt}`);
            break;
          }
          
          // If no extensions but no error, it might be not installed
          if (attempt === maxRetries) {
            throw new Error('Please install the Polkadot.js browser extension and refresh the page');
          }
        } catch (err) {
          console.warn(`Attempt ${attempt} failed:`, err.message);
          lastError = err;
          
          // Check for specific error types
          if (err.message.includes('does not exist')) {
            if (attempt < maxRetries) {
              continue; // Retry for "receiving end does not exist" errors
            }
            throw new Error('Polkadot.js extension is not responding. Please:\n1. Ensure the extension is installed\n2. Reload the extension in your browser\n3. Refresh this page');
          }
          
          // For other errors, throw immediately
          throw err;
        }
      }
      
      if (extensions.length === 0) {
        const error = new Error(lastError?.message || 'No extension installed, or the user did not accept the authorization');
        metrics.recordError(error, 'error', { operation: 'connectWallet' });
        throw error;
      }

      const accounts = await web3Accounts();
      setAccounts(accounts);

      if (accounts.length > 0) {
        setSelectedAccount(accounts[0]);
        metrics.recordWalletConnection(true);
        metrics.recordApiCall('connectWallet', Date.now() - startTime, true);

        // Set user context for error tracking
        setUserContext(accounts[0]);

        // Track successful wallet connection
        trackEvent('wallet_connected', {
          accountCount: accounts.length,
          selectedAccount: accounts[0].address,
        });

        console.log(`Wallet connected with ${accounts.length} accounts`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to connect wallet:', err);
      metrics.recordApiCall('connectWallet', Date.now() - startTime, false);
      metrics.recordError('WALLET_ERROR', err.message, { operation: 'connectWallet' });

      // Track wallet connection error
      trackError(err, {
        tags: {
          operation: 'connect_wallet',
          error_type: 'wallet_connection',
        },
        extra: {
          extensionCount: 0,
        },
      });
    }
  };

  const disconnectWallet = () => {
    if (selectedAccount) {
      metrics.recordWalletConnection(false);

      // Track wallet disconnection
      trackEvent('wallet_disconnected', {
        account: selectedAccount.address,
      });

      console.log('Wallet disconnected');
    }

    // Clear user context
    setUserContext(null);

    setSelectedAccount(null);
    setBalance(null);
  };

  const switchAccount = (account) => {
    const previousAddress = selectedAccount?.address;
    setSelectedAccount(account);

    if (previousAddress && previousAddress !== account.address) {
      console.log(`Switched account from ${previousAddress} to ${account.address}`);
      // Could add account switch metrics if needed
    }
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        selectedAccount,
        api,
        error,
        connectWallet,
        disconnectWallet,
        switchAccount,
        isApiReady,
        balance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

WalletProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};