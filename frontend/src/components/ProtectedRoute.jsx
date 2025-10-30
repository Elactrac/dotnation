import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, requireWallet = true }) => {
  const { selectedAccount } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireWallet && !selectedAccount) {
      // Redirect to landing page if wallet is required but not connected
      navigate('/', { 
        replace: true,
        state: { 
          message: 'Please connect your wallet to access this page',
          from: window.location.pathname
        }
      });
    }
  }, [selectedAccount, requireWallet, navigate]);

  // Show loading state while checking wallet connection
  if (requireWallet && !selectedAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl border-2 border-gray-700 p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg className="animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Required</h2>
          <p className="text-gray-400">Checking wallet connection...</p>
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
