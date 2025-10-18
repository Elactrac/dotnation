import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { metrics } from '../utils/metrics';

const WalletContext = createContext({});

export const WalletProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [api, setApi] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        // Try to initialize connection to Polkadot node (optional)
        try {
          const wsProvider = new WsProvider('wss://rpc.polkadot.io');
          const apiInstance = await Promise.race([
            ApiPromise.create({ provider: wsProvider }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
          ]);
          setApi(apiInstance);
          setIsApiReady(true);
          console.log('Connected to local Polkadot node');
        } catch (apiErr) {
          console.warn('Could not connect to local node, continuing without it:', apiErr.message);
        }

        // The app can work without a node connection, so continue anyway
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        console.error('Failed to initialize wallet:', err);
        setIsLoading(false);
      }
    };

    initializeWallet();
  }, []);

  useEffect(() => {
    const getBalance = async () => {
      if (api && selectedAccount) {
        const { data: { free: balance } } = await api.query.system.account(selectedAccount.address);
        setBalance(balance.toString());
      }
    };

    getBalance();
  }, [api, selectedAccount]);

  const connectWallet = async () => {
    const startTime = Date.now();
    
    try {
      const extensions = await web3Enable('DotNation');
      if (extensions.length === 0) {
        metrics.recordError('WALLET_ERROR', 'No extension installed', { operation: 'connectWallet' });
        throw new Error('No extension installed, or the user did not accept the authorization');
      }

      const accounts = await web3Accounts();
      setAccounts(accounts);

      if (accounts.length > 0) {
        setSelectedAccount(accounts[0]);
        metrics.recordWalletConnection(accounts[0].address, accounts.length);
        metrics.recordApiCall('connectWallet', Date.now() - startTime, true);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to connect wallet:', err);
      metrics.recordApiCall('connectWallet', Date.now() - startTime, false);
      metrics.recordError('WALLET_ERROR', err.message, { operation: 'connectWallet' });
    }
  };

  const disconnectWallet = () => {
    if (selectedAccount) {
      metrics.recordWalletDisconnection(selectedAccount.address);
    }
    setSelectedAccount(null);
  };

  const switchAccount = (account) => {
    const previousAddress = selectedAccount?.address;
    setSelectedAccount(account);
    
    if (previousAddress) {
      metrics.recordWalletSwitch(previousAddress, account.address);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        selectedAccount,
        api,
        isLoading,
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