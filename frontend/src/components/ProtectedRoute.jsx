import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, requireWallet = true }) => {
  const { selectedAccount, connectWallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireWallet && !selectedAccount) {
      // Store the intended destination for redirect after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      // Redirect to login page if wallet is STRICTLY required
      navigate('/login', { 
        replace: true,
        state: { 
          message: 'Please connect your wallet to access this page',
          from: window.location.pathname
        }
      });
    }
  }, [selectedAccount, requireWallet, navigate]);

  // If wallet is not required, render content directly (public page)
  if (!requireWallet) {
    return children;
  }

  // Show loading/redirect state while checking wallet connection for protected routes
  if (requireWallet && !selectedAccount) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-surface border border-border rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg className="animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Wallet Required</h2>
          <p className="text-text-secondary mb-6">Connect your wallet to access this page</p>
          <button 
            onClick={connectWallet}
            className="px-6 py-3 bg-white text-black font-semibold rounded-sm hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireWallet: PropTypes.bool,
};

export default ProtectedRoute;
