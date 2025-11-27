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
        className="bg-surface/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-border hover:border-primary/30 transition-all duration-500 w-full"
        role="region"
        aria-label="Campaign donation interface"
      >
        <div className="space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
              <Heart className="w-7 h-7" fill="currentColor" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-text-primary font-serif">Support Campaign</h3>
              <p className="text-sm text-text-secondary">Make a difference today</p>
            </div>
            {nftEnabled && (
              <div className="flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2" role="status" aria-label="NFT receipt enabled for donations">
                <Gift className="w-4 h-4 text-secondary" aria-hidden="true" />
                <span className="text-sm font-medium text-secondary">NFT Receipt</span>
              </div>
            )}
          </div>

          {campaign && (
            <div className="bg-primary/5 rounded-xl p-5 border border-primary/20" role="status" aria-label={`Campaign progress: ${formatDOT(campaign.raised)} DOT raised of ${formatDOT(campaign.goal)} DOT goal, ${progress.toFixed(1)}% complete`}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" />
                <p className="text-sm font-semibold text-primary">Progress</p>
              </div>
              <p className="text-3xl font-bold text-text-primary font-serif mb-1">{formatDOT(campaign.raised)} DOT</p>
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-text-secondary">of {formatDOT(campaign.goal)} DOT goal</p>
                <p className="text-sm font-bold text-primary">{progress.toFixed(1)}%</p>
              </div>
              <div className="mt-3 w-full bg-border rounded-full h-2" role="progressbar" aria-valuenow={Math.min(progress, 100)} aria-valuemin="0" aria-valuemax="100">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }}></div>
              </div>
            </div>
          )}

          {!selectedAccount && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4" role="alert">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-warning" aria-hidden="true" />
                <div>
                  <p className="font-bold text-warning">Wallet Not Connected</p>
                  <p className="text-sm text-warning/80 mt-1">Connect your wallet to donate</p>
                </div>
              </div>
            </div>
          )}

          {!contract && selectedAccount && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4" role="alert">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning" aria-hidden="true" />
                <div>
                  <p className="font-bold text-warning">Contract Not Loaded</p>
                  <p className="text-sm text-warning/80 mt-1">Check network connection</p>
                </div>
              </div>
            </div>
          )}

          {!isActive && (
            <div className="bg-info/10 border border-info/30 rounded-xl p-4" role="alert">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-info" aria-hidden="true" />
                <div>
                  <p className="font-bold text-info">Campaign Ended</p>
                  <p className="text-sm text-info/80 mt-1">{hasEnded ? 'Deadline reached' : 'No longer accepting donations'}</p>
                </div>
              </div>
            </div>
          )}

          {selectedAccount && contract && isActive && (
            <>
              <div role="group" aria-label="Quick amount selection">
                <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">Quick Select</label>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      disabled={isSubmitting}
                      className={`px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                        amount === value.toString()
                          ? 'bg-white text-black'
                          : 'bg-surface border border-border text-text-secondary hover:border-primary/50 hover:text-text-primary'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                      aria-label={`Select ${value} DOT as donation amount`}
                      aria-pressed={amount === value.toString()}
                    >
                      {value} DOT
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="donation-amount" className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Custom Amount</label>
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
                    className={`w-full px-4 py-4 bg-background-dark border ${
                      error ? 'border-error' : 'border-border focus:border-primary'
                    } rounded-xl text-text-primary text-lg font-bold placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'donation-amount-error' : undefined}
                    aria-label="Enter custom donation amount in DOT"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-bold" aria-hidden="true">DOT</span>
                </div>
                {error && (
                  <p className="text-error text-sm mt-2 flex items-center gap-1" id="donation-amount-error" role="alert">
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
                className={`w-full py-4 rounded-sm font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-600 ease-gravity ${
                  isSubmitting || !amount || !!error
                    ? 'bg-surface text-text-muted cursor-not-allowed'
                    : 'bg-white text-black hover:-translate-y-px hover:shadow-btn-hover'
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

              <div className="text-center text-xs text-text-muted bg-surface rounded-xl p-3 border border-border" role="status">
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
