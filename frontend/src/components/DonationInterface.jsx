import { useState, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, AlertCircle, CheckCircle, Wallet, TrendingUp, ArrowRight, Loader } from 'lucide-react';
import { web3FromAddress, web3Enable } from '@polkadot/extension-dapp';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext.jsx';
import { formatDOT, calculateProgress } from '../utils/formatters';
import { validateDonationAmount } from '../utils/validation';
import { asyncHandler } from '../utils/errorHandler';

export const DonationInterface = memo(({ campaignId, campaign }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { donateToCampaign, contract } = useCampaign();
  const { selectedAccount } = useWallet();
  const [toast, setToast] = useState({ show: false, type: '', title: '', description: '' });

  const suggestedAmounts = [1, 5, 10, 25];

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, toast.type === 'success' ? 7000 : 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, toast]);

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

  const showToastMessage = (type, title, description) => {
    setToast({ show: true, type, title, description });
  };

  const handleDonate = asyncHandler(async () => {
    console.log('[DonationInterface] handleDonate called');
    
    if (!selectedAccount) {
      showToastMessage('warning', 'Wallet Not Connected', 'Please connect your wallet to make a donation');
      return;
    }
    
    if (!contract) {
      showToastMessage('warning', 'Contract Not Loaded', 'Smart contract is not loaded. Check your network connection.');
      return;
    }

    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      showToastMessage('error', 'Invalid Amount', validationError);
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
          tx.signAndSend(selectedAccount.address, { signer: injector.signer }, ({ status, dispatchError }) => {
            if (status.isFinalized) {
              if (dispatchError) {
                reject(new Error(dispatchError.toString()));
              } else {
                showToastMessage('success', 'Donation Successful! 🎉', `You donated ${amount} DOT. Thank you for your support!`);
                setAmount('');
                setError('');
                resolve();
              }
            }
          }).catch(reject);
        });
      } else {
        showToastMessage('success', 'Donation Successful! 🎉', `You donated ${amount} DOT. Thank you!`);
        setAmount('');
        setError('');
      }
    } catch (err) {
      console.error('[DonationInterface] Error:', err);
      showToastMessage('error', 'Donation Failed', err.message || 'Failed to process donation');
    } finally {
      setIsSubmitting(false);
    }
  });

  const isActive = campaign?.state === 'Active';
  const hasEnded = campaign?.deadline ? new Date(campaign.deadline) < new Date() : false;
  const progress = campaign ? calculateProgress(campaign.raised, campaign.goal) : 0;

  return (
    <>
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-[100] px-6 py-4 rounded-2xl shadow-2xl max-w-md border-2 ${
              toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
              toast.type === 'warning' ? 'bg-yellow-500/90 border-yellow-400 text-white' :
              'bg-red-500/90 border-red-400 text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {toast.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <div>
                <p className="font-bold text-lg">{toast.title}</p>
                <p className="text-sm mt-1">{toast.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl border-2 border-primary/30"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-700">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-red-600 text-white shadow-lg">
              <Heart className="w-7 h-7" fill="currentColor" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Support Campaign</h3>
              <p className="text-sm text-gray-400">Make a difference today</p>
            </div>
          </div>

          {campaign && (
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-5 border-2 border-blue-500/30">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <p className="text-sm font-semibold text-blue-300">Progress</p>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{formatDOT(campaign.raised)} DOT</p>
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-gray-300">of {formatDOT(campaign.goal)} DOT goal</p>
                <p className="text-sm font-bold text-blue-400">{progress.toFixed(1)}%</p>
              </div>
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }}></div>
              </div>
            </div>
          )}

          {!selectedAccount && (
            <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="font-bold text-yellow-300">Wallet Not Connected</p>
                  <p className="text-sm text-yellow-200/80 mt-1">Connect your wallet to donate</p>
                </div>
              </div>
            </div>
          )}

          {!contract && selectedAccount && (
            <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="font-bold text-orange-300">Contract Not Loaded</p>
                  <p className="text-sm text-orange-200/80 mt-1">Check network connection</p>
                </div>
              </div>
            </div>
          )}

          {!isActive && (
            <div className="bg-blue-500/10 border-2 border-blue-500/50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-bold text-blue-300">Campaign Ended</p>
                  <p className="text-sm text-blue-200/80 mt-1">{hasEnded ? 'Deadline reached' : 'No longer accepting donations'}</p>
                </div>
              </div>
            </div>
          )}

          {selectedAccount && contract && isActive && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">Quick Select</label>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      disabled={isSubmitting}
                      className={`px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                        amount === value.toString()
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:border-blue-500/50'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
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
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">DOT</span>
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
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
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" fill="currentColor" />
                    Donate Now
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <div className="text-center text-xs text-gray-400 bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                🔒 Secure transaction via Polkadot.js extension
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
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
};

export default DonationInterface;
