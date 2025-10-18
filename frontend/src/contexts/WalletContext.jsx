import React, { createContext, useState, useContext, useEffect } from 'react';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';

const WalletContext = createContext({});

export const WalletProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [api, setApi] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const connectWallet = async () => {
    try {
      const extensions = await web3Enable('DotNation');
      if (extensions.length === 0) {
        throw new Error('No extension installed, or the user did not accept the authorization');
      }

      const accounts = await web3Accounts();
      setAccounts(accounts);

      if (accounts.length > 0) {
        setSelectedAccount(accounts[0]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to connect wallet:', err);
    }
  };

  const disconnectWallet = () => {
    setSelectedAccount(null);
  };

  const switchAccount = (account) => {
    setSelectedAccount(account);
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};