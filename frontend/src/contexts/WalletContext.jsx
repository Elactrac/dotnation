import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { metrics } from '../utils/metrics';
import { setUserContext, trackEvent, trackError } from '../utils/sentry';
import { useApi } from './ApiContext';
import CaptchaModal from '../components/CaptchaModal';

const WalletContext = createContext({});

export const WalletProvider = ({ children }) => {
  const { api, isReady: isApiReady } = useApi();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

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
    // Show captcha first if not already verified
    if (!captchaVerified) {
      setShowCaptcha(true);
      return;
    }

    const startTime = Date.now();

    try {
      const extensions = await web3Enable('DotNation');
      if (extensions.length === 0) {
        const error = new Error('No extension installed, or the user did not accept the authorization');
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

  const handleCaptchaVerify = (verified) => {
    if (verified) {
      setCaptchaVerified(true);
      // Track captcha verification
      trackEvent('captcha_verified', {
        timestamp: new Date().toISOString(),
      });
      // Automatically proceed with wallet connection after captcha is verified
      setTimeout(() => {
        connectWalletAfterCaptcha();
      }, 100);
    }
  };

  const connectWalletAfterCaptcha = async () => {
    const startTime = Date.now();

    try {
      const extensions = await web3Enable('DotNation');
      if (extensions.length === 0) {
        const error = new Error('No extension installed, or the user did not accept the authorization');
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
    setCaptchaVerified(false); // Reset captcha verification on disconnect
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
      <CaptchaModal
        isOpen={showCaptcha}
        onClose={() => setShowCaptcha(false)}
        onVerify={handleCaptchaVerify}
      />
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