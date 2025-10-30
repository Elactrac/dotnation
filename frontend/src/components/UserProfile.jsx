import { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Copy, Check, Award, Heart, TrendingUp } from 'lucide-react';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { CampaignCard } from './CampaignCard.jsx';

export const UserProfile = ({ address }) => {
  const { campaigns } = useCampaign();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [toast, setToast] = useState({ show: false, title: '', type: 'success' });

  // Handle copy address
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setToast({ show: true, title: 'Address copied!', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Get user's created campaigns
  const createdCampaigns = useMemo(() => 
    campaigns.filter(campaign => campaign.creator === address),
    [campaigns, address]
  );

  // Get user's donations
  const donations = useMemo(() => {
    const userDonations = [];
    campaigns.forEach(campaign => {
      campaign.donations
        .filter(donation => donation.donor === address)
        .forEach(donation => {
          userDonations.push({
            ...donation,
            campaignTitle: campaign.title,
            campaignId: campaign.id,
          });
        });
    });
    return userDonations.sort((a, b) => b.timestamp - a.timestamp);
  }, [campaigns, address]);

  // Calculate total contribution
  const totalContribution = useMemo(() => 
    donations.reduce((sum, donation) => sum + donation.amount, 0),
    [donations]
  );

  // Generate avatar background color from address
  const avatarColor = useMemo(() => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500'
    ];
    const index = address ? address.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }, [address]);

  return (
    <div className="w-full space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="font-medium">{toast.title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-8"
      >
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center shadow-lg`}>
            <User className="w-12 h-12 text-white" />
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-4">
            {/* Address Row */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Address:</span>
              <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg">
                {address?.slice(0, 8)}...{address?.slice(-6)}
              </code>
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Campaigns Created */}
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Campaigns</p>
                    <p className="text-2xl font-bold">{createdCampaigns.length}</p>
                  </div>
                  <Award className="w-8 h-8 opacity-80" />
                </div>
              </div>

              {/* Donations Made */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Donations</p>
                    <p className="text-2xl font-bold">{donations.length}</p>
                  </div>
                  <Heart className="w-8 h-8 opacity-80" />
                </div>
              </div>

              {/* Total Contributed */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Contributed</p>
                    <p className="text-xl font-bold">{(totalContribution / 1_000_000_000_000).toFixed(2)} DOT</p>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      >
        {/* Tab Headers */}
        <div className="border-b border-gray-200 bg-gray-50/50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'campaigns'
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Created Campaigns
              {activeTab === 'campaigns' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'donations'
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Donation History
              {activeTab === 'donations' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'campaigns' && (
              <motion.div
                key="campaigns"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {createdCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {createdCampaigns.map((campaign, index) => (
                      <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CampaignCard campaign={campaign} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No campaigns created yet</p>
                    <p className="text-gray-400 text-sm mt-2">Start by creating your first campaign!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'donations' && (
              <motion.div
                key="donations"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {donations.length > 0 ? (
                  donations.map((donation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Heart className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{donation.campaignTitle}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(donation.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            {(donation.amount / 1_000_000_000_000).toFixed(2)} DOT
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No donations made yet</p>
                    <p className="text-gray-400 text-sm mt-2">Start supporting campaigns today!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

UserProfile.propTypes = {
  address: PropTypes.string.isRequired,
};

export default UserProfile;