import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Heart, AlertCircle, Wallet, TrendingUp, ArrowRight, Loader, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { web3FromAddress, web3Enable } from '@polkadot/extension-dapp';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext.jsx';
import { useNft } from '../contexts/NftContext.jsx';
import { formatDOT, calculateProgress } from '../utils/formatters';
import { validateDonationAmount } from '../utils/validation';
import { asyncHandler } from '../utils/errorHandler';

export const DonationInterface = memo(({ campaignId, campaign, onDonationSuccess }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { donateToCampaign, contract } = useCampaign();
  const { selectedAccount } = useWallet();
  const { nftEnabled, mintNftReceipt } = useNft();

  const suggestedAmounts = [1, 5, 10, 25];

  const validateAmount = (value) => {
    if (!value || value === '') {
      return 'Amount is required';
    }

    try {
      validateDonationAmount(value);
    } catch (validationError) {
      return validationError.message || 'Invalid donation amount';
    }

    return '';
  };

  const handleAmountChange = (value) => {
    setAmount(value);
    const validationError = value ? validateAmount(value) : '';
    setError(validationError);
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
    setError('');
  };

  const handleDonate = asyncHandler(async () => {
    console.log('[DonationInterface] handleDonate called');
    
    if (!selectedAccount) {
      toast.error('Please connect your wallet to make a donation');
      return;
    }
    
    if (!contract) {
      toast.error('Smart contract is not loaded. Check your network connection.');
      return;
    }

    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
  const amountInPlancks = validateDonationAmount(amount);
  const tx = await donateToCampaign(campaignId, amountInPlancks);
      
      if (tx && typeof tx.signAndSend === 'function') {
        const extensions = await web3Enable('DotNation');
        if (!extensions || extensions.length === 0) {
          throw new Error('No Polkadot extension found');
        }
        
        const injector = await web3FromAddress(selectedAccount.address);

          await new Promise((resolve, reject) => {
          tx.signAndSend(selectedAccount.address, { signer: injector.signer }, async ({ status, dispatchError }) => {
            if (status.isFinalized) {
              if (dispatchError) {
                reject(new Error(dispatchError.toString()));
              } else {
                // Try to mint NFT if enabled
                if (nftEnabled) {
                  try {
                    await mintNftReceipt(
                      campaignId,
                      campaign?.title || 'Campaign',
                      amountInPlancks,
                      Date.now()
                    );
                    toast.success(`🎉 Donation Successful! You donated ${amount} DOT. NFT receipt minted!`);
                  } catch (nftError) {
                    console.error('NFT minting failed:', nftError);
                    toast.success(`🎉 Donation Successful! You donated ${amount} DOT. (NFT minting pending)`);
                  }
                } else {
                  toast.success(`🎉 Donation Successful! You donated ${amount} DOT. Thank you for your support!`);
                }
                setAmount('');
                setError('');
                // Trigger callback to refresh campaign details
                if (onDonationSuccess) {
                  onDonationSuccess();
                }
                resolve();
              }
            }
          }).catch(reject);
        });
      } else {
        // Try to mint NFT if enabled
        if (nftEnabled) {
          try {
            await mintNftReceipt(
              campaignId,
              campaign?.title || 'Campaign',
              amountInPlancks,
              Date.now()
            );
            toast.success(`🎉 Donation Successful! You donated ${amount} DOT. NFT receipt minted!`);
          } catch (nftError) {
            console.error('NFT minting failed:', nftError);
            toast.success(`🎉 Donation Successful! You donated ${amount} DOT. (NFT minting pending)`);
          }
        } else {
          toast.success(`🎉 Donation Successful! You donated ${amount} DOT. Thank you!`);
        }
        setAmount('');
        setError('');
        // Trigger callback to refresh campaign details
        if (onDonationSuccess) {
          onDonationSuccess();
        }
      }
    } catch (err) {
      console.error('[DonationInterface] Error:', err);
      toast.error(err.message || 'Failed to process donation');
    } finally {
      setIsSubmitting(false);
    }
  });

  const isActive = campaign?.state === 'Active';
  const hasEnded = campaign?.deadline ? new Date(campaign.deadline) < new Date() : false;
  const progress = campaign ? calculateProgress(campaign.raised, campaign.goal) : 0;

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-primary/30 hover:border-primary/50 transition-all duration-500 w-full"
        role="region"
        aria-label="Campaign donation interface"
      >
        <div className="space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b-2 border-gray-700">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-red-600 text-white shadow-lg" aria-hidden="true">
              <Heart className="w-8 h-8" fill="currentColor" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white">Support Campaign</h3>
              <p className="text-base text-gray-400">Make a difference today</p>
            </div>
            {nftEnabled && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full px-4 py-2" role="status" aria-label="NFT receipt enabled for donations">
                <Gift className="w-4 h-4 text-white" aria-hidden="true" />
                <span className="text-sm font-semibold text-white">NFT Receipt</span>
              </div>
            )}
          </div>

          {campaign && (
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-5 border-2 border-blue-500/30" role="status" aria-label={`Campaign progress: ${formatDOT(campaign.raised)} DOT raised of ${formatDOT(campaign.goal)} DOT goal, ${progress.toFixed(1)}% complete`}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-400" aria-hidden="true" />
                <p className="text-sm font-semibold text-blue-300">Progress</p>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{formatDOT(campaign.raised)} DOT</p>
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-gray-300">of {formatDOT(campaign.goal)} DOT goal</p>
                <p className="text-sm font-bold text-blue-400">{progress.toFixed(1)}%</p>
              </div>
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2.5" role="progressbar" aria-valuenow={Math.min(progress, 100)} aria-valuemin="0" aria-valuemax="100">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }}></div>
              </div>
            </div>
          )}

          {!selectedAccount && (
            <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-2xl p-4" role="alert">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-yellow-400" aria-hidden="true" />
                <div>
                  <p className="font-bold text-yellow-300">Wallet Not Connected</p>
                  <p className="text-sm text-yellow-200/80 mt-1">Connect your wallet to donate</p>
                </div>
              </div>
            </div>
          )}

          {!contract && selectedAccount && (
            <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-2xl p-4" role="alert">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400" aria-hidden="true" />
                <div>
                  <p className="font-bold text-orange-300">Contract Not Loaded</p>
                  <p className="text-sm text-orange-200/80 mt-1">Check network connection</p>
                </div>
              </div>
            </div>
          )}

          {!isActive && (
            <div className="bg-blue-500/10 border-2 border-blue-500/50 rounded-2xl p-4" role="alert">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400" aria-hidden="true" />
                <div>
                  <p className="font-bold text-blue-300">Campaign Ended</p>
                  <p className="text-sm text-blue-200/80 mt-1">{hasEnded ? 'Deadline reached' : 'No longer accepting donations'}</p>
                </div>
              </div>
            </div>
          )}

          {selectedAccount && contract && isActive && (
            <>
              <div role="group" aria-label="Quick amount selection">
                <label className="block text-sm font-bold text-gray-300 mb-3">Quick Select</label>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      disabled={isSubmitting}
                      className={`px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                        amount === value.toString()
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                          : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:border-blue-500/50'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                      aria-label={`Select ${value} DOT as donation amount`}
                      aria-pressed={amount === value.toString()}
                    >
                      {value} DOT
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="donation-amount" className="block text-sm font-bold text-gray-300 mb-2">Custom Amount</label>
                <div className="relative">
                  <input
                    id="donation-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="0.00"
                    step="0.001"
                    min="0.001"
                    className={`w-full px-4 py-4 bg-gray-800 border-2 ${
                      error ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                    } rounded-xl text-white text-lg font-bold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'donation-amount-error' : undefined}
                    aria-label="Enter custom donation amount in DOT"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold" aria-hidden="true">DOT</span>
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1" id="donation-amount-error" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {error}
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                onClick={handleDonate}
                disabled={isSubmitting || !amount || !!error}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
                  isSubmitting || !amount || !!error
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-red-600 text-white hover:shadow-2xl'
                }`}
                aria-label={isSubmitting ? 'Processing donation transaction' : `Donate ${amount || '0'} DOT to campaign`}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" aria-hidden="true" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" fill="currentColor" aria-hidden="true" />
                    Donate Now
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </>
                )}
              </motion.button>

              <div className="text-center text-xs text-gray-400 bg-gray-800/50 rounded-xl p-3 border border-gray-700" role="status">
                <span aria-label="Secure transaction via Polkadot.js extension">🔒 Secure transaction via Polkadot.js extension</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
  );
});

DonationInterface.displayName = 'DonationInterface';

DonationInterface.propTypes = {
  campaignId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  campaign: PropTypes.shape({
    state: PropTypes.string,
    deadline: PropTypes.number,
    raised: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bigint]),
    goal: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bigint]),
  }),
  onDonationSuccess: PropTypes.func,
};

export default DonationInterface;
