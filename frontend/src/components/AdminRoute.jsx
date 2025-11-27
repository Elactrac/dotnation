import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import PropTypes from 'prop-types';

/**
 * Admin-only route protection component.
 * Checks if the connected wallet is in the list of admin addresses.
 * Admin addresses are configured via VITE_ADMIN_ADDRESSES environment variable.
 */
const AdminRoute = ({ children }) => {
  const { selectedAccount } = useWallet();
  const navigate = useNavigate();

  // Get admin addresses from environment variable (comma-separated)
  const adminAddresses = (import.meta.env.VITE_ADMIN_ADDRESSES || '')
    .split(',')
    .map(addr => addr.trim().toLowerCase())
    .filter(addr => addr.length > 0);

  const isAdmin = selectedAccount && 
    adminAddresses.includes(selectedAccount.address.toLowerCase());

  useEffect(() => {
    if (!selectedAccount) {
      // Redirect to landing page if wallet is not connected
      navigate('/', { 
        replace: true,
        state: { 
          message: 'Please connect your wallet to access this page',
          from: window.location.pathname
        }
      });
    } else if (!isAdmin) {
      // Redirect to dashboard if wallet is connected but not admin
      navigate('/dashboard', { 
        replace: true,
        state: { 
          message: 'You do not have permission to access this page',
          from: window.location.pathname
        }
      });
    }
  }, [selectedAccount, isAdmin, navigate]);

  // Show loading state while checking
  if (!selectedAccount) {
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

  // Show unauthorized state if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl border-2 border-red-700/50 p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You do not have permission to access this admin area.</p>
        </div>
      </div>
    );
  }

  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminRoute;
