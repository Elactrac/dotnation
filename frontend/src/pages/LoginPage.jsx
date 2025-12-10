import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { connectWallet, selectedAccount } = useWallet();
  const navigate = useNavigate();
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    // Get message from navigation state if available
    const state = window.history.state?.usr;
    if (state?.message) {
      setMessage(state.message);
    }
  }, []);

  React.useEffect(() => {
    if (selectedAccount) {
      // Check if there's a redirect path stored (from ProtectedRoute)
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        // Default: send to home page where users can choose their path
        navigate('/');
      }
    }
  }, [selectedAccount, navigate]);

  return (
    <div className="min-h-screen bg-background-base text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {message && (
          <div className="mb-6 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">{message}</p>
          </div>
        )}
        <h1 className="text-3xl font-display mb-8">Connect Your Wallet</h1>
        <p className="text-lg text-text-secondary mb-6">
          To access DotNation, please connect your wallet.
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