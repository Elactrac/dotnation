import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { connectWallet, selectedAccount } = useWallet();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (selectedAccount) {
      navigate('/dashboard');
    }
  }, [selectedAccount, navigate]);

  return (
    <div className="min-h-screen bg-background-base text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-display mb-8">Connect Your Wallet</h1>
        <p className="text-lg text-text-secondary mb-6">
          To access Paperweight, please connect your wallet.
        </p>
        <button
          onClick={connectWallet}
          className="bg-white text-black px-6 py-3 font-semibold rounded-sm hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default LoginPage;