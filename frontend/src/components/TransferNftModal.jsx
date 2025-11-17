import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNft } from '../contexts/NftContext';

/**
 * Modal for transferring NFTs to another address
 */
const TransferNftModal = ({ isOpen, onClose, nft }) => {
  const { transferNft } = useNft();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [error, setError] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Validate Polkadot address format
  const isValidAddress = (address) => {
    // Basic validation: should start with 5 (mainnet) or other valid prefixes
    // and be 47-48 characters long (SS58 format)
    return /^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(address);
  };

  const handleAddressChange = (e) => {
    const value = e.target.value.trim();
    setRecipientAddress(value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!recipientAddress) {
      setError('Please enter a recipient address');
      return;
    }

    if (!isValidAddress(recipientAddress)) {
      setError('Invalid Polkadot address format');
      return;
    }

    // Show confirmation before transfer
    setShowConfirmation(true);
  };

  const handleConfirmTransfer = async () => {
    setIsTransferring(true);
    setError('');

    try {
      await transferNft(recipientAddress, nft.tokenId);
      
      // Success - close modal
      handleClose();
    } catch (err) {
      console.error('Transfer failed:', err);
      setError(err.message || 'Transfer failed. Please try again.');
      setShowConfirmation(false);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    setRecipientAddress('');
    setError('');
    setShowConfirmation(false);
    setIsTransferring(false);
    onClose();
  };

  if (!isOpen || !nft) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20 max-w-md w-full p-8 animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isTransferring}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!showConfirmation ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2 font-display">
                Transfer NFT
              </h2>
              <p className="text-white/60 text-sm">
                Send this NFT to another address
              </p>
            </div>

            {/* NFT Preview */}
            <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{nft.metadata?.campaignTitle || 'Donation NFT'}</p>
                  <p className="text-white/60 text-sm">Token #{nft.tokenId}</p>
                </div>
              </div>
            </div>

            {/* Transfer Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Address Input */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={handleAddressChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono"
                  placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  autoFocus
                  disabled={isTransferring}
                />
                <p className="text-white/50 text-xs mt-2">
                  Enter a valid Polkadot/Substrate address
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 animate-shake">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-yellow-400 text-xs leading-relaxed">
                  This action cannot be undone. Make sure the recipient address is correct.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
                  disabled={isTransferring}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isTransferring || !recipientAddress}
                >
                  Continue
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Confirmation Screen */}
            <div className="text-center mb-6">
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-xl"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2 font-display">
                Confirm Transfer
              </h2>
              <p className="text-white/60 text-sm">
                Please review the details carefully
              </p>
            </div>

            {/* Transfer Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">NFT</p>
                <p className="text-white font-semibold">{nft.metadata?.campaignTitle || 'Donation NFT'}</p>
                <p className="text-white/60 text-sm">Token #{nft.tokenId}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">Recipient</p>
                <p className="text-white text-sm font-mono break-all">{recipientAddress}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 animate-shake mb-6">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
                disabled={isTransferring}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isTransferring}
              >
                {isTransferring ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Transferring...
                  </span>
                ) : (
                  'Confirm Transfer'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

TransferNftModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nft: PropTypes.shape({
    tokenId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    metadata: PropTypes.shape({
      campaignTitle: PropTypes.string,
    }),
  }),
};

export default TransferNftModal;
