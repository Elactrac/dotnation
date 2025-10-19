import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const { connectWallet, selectedAccount } = useWallet();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (selectedAccount) {
      navigate('/dashboard');
    }
  }, [selectedAccount, navigate]);

  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">Join DotNation</h1>
        <p className="text-lg mb-6">
          Sign up by connecting your Polkadot-compatible wallet to start funding or creating campaigns.
        </p>
        <button
          onClick={connectWallet}
          className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default SignupPage;