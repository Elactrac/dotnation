import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';
import { X, User, Calendar, Target, CheckCircle, AlertCircle } from 'lucide-react';
import {
  formatDOT,
  formatDate,
  formatRelativeTime,
  shortenAddress,
  calculateProgress,
  getDeadlineStatus,
  getCampaignStateColor,
  parseDOT,
} from '../utils/formatters';

export const CampaignDetails = () => {
  const { id } = useParams();
  const { campaigns, donateToCampaign } = useCampaign();
  const { selectedAccount } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', title: '', description: '' });

  useEffect(() => {
    const foundCampaign = campaigns.find(c => c.id === parseInt(id));
    setCampaign(foundCampaign);
  }, [campaigns, id]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-lg">Campaign not found</p>
      </div>
    );
  }

  const progress = calculateProgress(campaign.raised || campaign.fundsRaised, campaign.goal);
  const deadlineStatus = getDeadlineStatus(campaign.deadline);
  const stateColor = getCampaignStateColor(campaign.state || 'Active');

  const showToast = (type, title, description) => {
    setToast({ show: true, type, title, description });
  };

  const handleDonate = async () => {
    try {
      if (!selectedAccount) {
        throw new Error('Please connect your wallet first');
      }

      const amountInPlancks = parseDOT(donationAmount);
      await donateToCampaign(campaign.id, amountInPlancks);

      showToast('success', 'Donation Successful', `You donated ${donationAmount} DOT to ${campaign.title} 🎉`);

      setIsModalOpen(false);
      setDonationAmount('');
    } catch (error) {
      showToast('error', 'Error', error.message || 'Failed to process donation');
    }
  };

  const getStateColorClass = (color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800 border-green-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      gray: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colorMap[color] || colorMap.blue;
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
                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{toast.title}</p>
                <p className="text-sm opacity-90">{toast.description}</p>
              </div>
              <button
                onClick={() => setToast({ ...toast, show: false })}
                className="ml-auto p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex gap-2 mb-3">
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStateColorClass(deadlineStatus.color)}`}>
              {deadlineStatus.message}
            </span>
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStateColorClass(stateColor)}`}>
              {campaign.state || 'Active'}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{campaign.title}</h1>
          <p className="text-lg text-gray-600 mb-2">{campaign.description}</p>
          <p className="text-sm text-gray-500">
            Created {formatRelativeTime(campaign.createdAt || Date.now())}
          </p>
        </motion.div>

        {/* Progress Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Raised</p>
              <p className="text-3xl font-bold text-gray-900">{formatDOT(campaign.raised || campaign.fundsRaised)} DOT</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Goal</p>
              <p className="text-3xl font-bold text-gray-900">{formatDOT(campaign.goal)} DOT</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Progress</p>
              <p className="text-3xl font-bold text-gray-900">{progress.toFixed(1)}%</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className={`absolute top-0 left-0 h-full rounded-full ${
                progress >= 100
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}
            />
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Campaign Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Details</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <User className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-mono text-gray-900">{shortenAddress(campaign.owner)}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Beneficiary</p>
                  <p className="font-mono text-gray-900">{shortenAddress(campaign.beneficiary)}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p className="text-gray-900">{formatDate(campaign.deadline)}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-gray-900">{campaign.state || 'Active'}</p>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Donation Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg border border-purple-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Support this Campaign</h2>
            <p className="text-gray-600 mb-6">Your contribution helps make this campaign successful.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={deadlineStatus.isEnded || campaign.state !== 'Active'}
              className={`w-full py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-200 ${
                deadlineStatus.isEnded || campaign.state !== 'Active'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
              }`}
            >
              {deadlineStatus.isEnded ? 'Campaign Ended' : 'Donate Now'}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Donation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Donate to {campaign.title}</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  <div className="mb-6">
                    <label htmlFor="donation-amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (DOT)
                    </label>
                    <input
                      id="donation-amount"
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={!donationAmount || !selectedAccount}
                    className={`w-full py-3 px-6 text-base font-semibold rounded-xl transition-all duration-200 ${
                      !donationAmount || !selectedAccount
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                    }`}
                  >
                    Confirm Donation
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};