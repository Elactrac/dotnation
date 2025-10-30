import { useState, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, AlertCircle, CheckCircle, Wallet, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext.jsx';
import { parseDOT, formatDOT, isValidPositiveNumber } from '../utils/formatters';
import { asyncHandler } from '../utils/errorHandler';

export const DonationInterface = memo(({ campaignId, campaign }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { donateToCampaign } = useCampaign();
  const { selectedAccount } = useWallet();
  const [toast, setToast] = useState({ show: false, type: '', title: '', description: '' });

  // Suggested donation amounts
  const suggestedAmounts = [10, 25, 50, 100];

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, toast.type === 'success' ? 7000 : 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const validateAmount = (value) => {
    if (!value || value === '') {
      return 'Amount is required';
    }
    if (!isValidPositiveNumber(value)) {
      return 'Please enter a valid positive number';
    }
    const numValue = parseFloat(value);
    if (numValue < 0.1) {
      return 'Minimum donation is 0.1 DOT';
    }
    if (numValue > 100000) {
      return 'Maximum donation is 100,000 DOT';
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
    if (!selectedAccount) {
      showToastMessage('warning', 'Wallet Not Connected', 'Please connect your wallet to make a donation');
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
      const amountInPlancks = parseDOT(amount);
      await donateToCampaign(campaignId, amountInPlancks);
      
      showToastMessage('success', 'Donation Successful! 🎉', `You donated ${amount} DOT to this campaign. Thank you for your support!`);
      
      setAmount(''); // Reset amount after successful donation
      setError('');
    } catch (err) {
      showToastMessage('error', 'Donation Failed', err.message || 'Failed to process donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  });

  // Calculate if campaign is active
  const isActive = campaign?.state === 'Active';
  const hasEnded = campaign?.deadline ? new Date(campaign.deadline) < new Date() : false;

  const handleIncrement = () => {
    const currentValue = parseFloat(amount) || 0;
    setAmount((currentValue + 0.1).toFixed(1));
    setError('');
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(amount) || 0;
    if (currentValue > 0.1) {
      setAmount((currentValue - 0.1).toFixed(1));
      setError('');
    }
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl max-w-md ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : toast.type === 'warning'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{toast.title}</p>
                <p className="text-sm opacity-90">{toast.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Donation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg">
              <Heart className="w-6 h-6" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Support This Campaign</h2>
          </div>

          {/* Campaign Stats */}
          {campaign && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-gray-600">Current Progress</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{formatDOT(campaign.raised)} DOT</p>
              <p className="text-sm text-gray-600">of {formatDOT(campaign.goal)} DOT goal</p>
            </motion.div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Wallet Warning */}
          {!selectedAccount && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">Wallet Not Connected</p>
                  <p className="text-sm text-yellow-700">Connect your wallet to make a donation</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Campaign Ended Warning */}
          {!isActive && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Campaign Ended</p>
                  <p className="text-sm text-blue-700">
                    {hasEnded ? 'This campaign has reached its deadline' : 'This campaign is no longer accepting donations'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Quick Select</label>
            <div className="flex flex-wrap gap-2">
              {suggestedAmounts.map((value, index) => (
                <motion.button
                  key={value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  onClick={() => handleQuickAmount(value)}
                  disabled={!selectedAccount || !isActive}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    amount === value.toString()
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white border-2 border-blue-200 text-blue-600 hover:border-blue-400 hover:shadow-md'
                  } ${
                    !selectedAccount || !isActive
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  {value} DOT
                </motion.button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label htmlFor="donation-amount" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Amount (DOT)
            </label>
            <div className="relative">
              <input
                id="donation-amount"
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter donation amount"
                step="0.1"
                min="0.1"
                disabled={!selectedAccount || !isActive}
                className={`w-full px-4 py-3 pr-16 border rounded-xl outline-none transition-all ${
                  error
                    ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                } ${
                  !selectedAccount || !isActive
                    ? 'bg-gray-100 cursor-not-allowed'
                    : 'bg-white'
                }`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={!selectedAccount || !isActive}
                  className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={!selectedAccount || !isActive}
                  className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
          </div>

          {/* Donate Button */}
          <motion.button
            whileHover={selectedAccount && isActive && !error && amount ? { scale: 1.02 } : {}}
            whileTap={selectedAccount && isActive && !error && amount ? { scale: 0.98 } : {}}
            onClick={handleDonate}
            disabled={!selectedAccount || !isActive || !!error || !amount || isSubmitting}
            className={`w-full py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              !selectedAccount || !isActive || !!error || !amount || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Donation...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" fill="currentColor" />
                {!selectedAccount 
                  ? 'Connect Wallet to Donate' 
                  : !isActive 
                  ? 'Campaign Ended' 
                  : amount 
                  ? `Donate ${amount} DOT` 
                  : 'Enter Amount'}
              </>
            )}
          </motion.button>

          {/* Helper Text */}
          <p className="text-xs text-gray-500 text-center">
            Your donation will be sent directly to the campaign beneficiary on the blockchain
          </p>
        </div>
      </motion.div>
    </>
  );
});

DonationInterface.displayName = 'DonationInterface';

DonationInterface.propTypes = {
  campaignId: PropTypes.string.isRequired,
  campaign: PropTypes.shape({
    state: PropTypes.string,
    deadline: PropTypes.number,
    raised: PropTypes.number,
    goal: PropTypes.number,
  }),
};

export default DonationInterface;