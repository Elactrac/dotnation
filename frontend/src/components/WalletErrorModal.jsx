import PropTypes from 'prop-types';
import { FiX, FiAlertCircle } from 'react-icons/fi';

/**
 * Modal component to display wallet connection errors
 */
const WalletErrorModal = ({ isOpen, onClose, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative bg-surface backdrop-blur-xl rounded-2xl border-2 border-border shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-error" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Wallet Connection Failed</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface/50"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-text-secondary mb-4 leading-relaxed">
            {error || 'Unable to connect to your wallet. Please make sure you have the Polkadot.js extension installed.'}
          </p>

          <div className="bg-surface/50 border border-border rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-text-primary mb-2">To fix this issue:</p>
            <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
              <li>Install the <a href="https://polkadot.js.org/extension/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Polkadot.js extension</a></li>
              <li>Create or import a wallet account</li>
              <li>Refresh this page and try connecting again</li>
              <li>Make sure to approve the connection request</li>
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <a
            href="https://polkadot.js.org/extension/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all text-center"
          >
            Install Extension
          </a>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-surface border border-border text-text-primary rounded-lg font-medium hover:bg-surface/80 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

WalletErrorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default WalletErrorModal;
