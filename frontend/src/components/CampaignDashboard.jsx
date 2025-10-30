
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Heart, DollarSign, Calendar, User, Award, Target } from 'lucide-react';
import { useCampaign } from '../contexts/CampaignContext';

export const CampaignDashboard = ({ campaignId }) => {
  const { campaigns } = useCampaign();
  const campaign = campaigns.find(c => c.id === campaignId);

  if (!campaign) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">Campaign not found</p>
      </motion.div>
    );
  }

  const totalRaised = campaign.donations.reduce((sum, d) => sum + d.amount, 0);
  const progress = (totalRaised / campaign.goal) * 100;
  const donorCount = new Set(campaign.donations.map(d => d.donor)).size;
  const avgDonation = totalRaised / campaign.donations.length || 0;
  
  // Sort donations by amount (descending) to get top donors
  const topDonors = [...campaign.donations]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map(donation => ({
      address: donation.donor,
      amount: donation.amount / 1_000_000_000_000, // Convert to DOT
      timestamp: new Date(donation.timestamp).toLocaleString(),
    }));

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          {campaign.title}
        </h1>
        <p className="text-gray-500 mt-1">Campaign Dashboard</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Raised Stat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Total Raised</p>
              <p className="text-3xl font-bold mt-1">{(totalRaised / 1_000_000_000_000).toFixed(2)} DOT</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {progress >= 50 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{progress.toFixed(1)}% of goal</span>
          </div>
        </motion.div>

        {/* Contributors Stat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Contributors</p>
              <p className="text-3xl font-bold mt-1">{donorCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm opacity-90">unique donors</p>
        </motion.div>

        {/* Average Donation Stat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Average Donation</p>
              <p className="text-3xl font-bold mt-1">{(avgDonation / 1_000_000_000_000).toFixed(2)} DOT</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm opacity-90">per donation</p>
        </motion.div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Donors Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Top Donors</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            {topDonors.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount (DOT)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topDonors.map((donor, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="hover:bg-purple-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono text-gray-700">
                          {donor.address.slice(0, 8)}...{donor.address.slice(-6)}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          {donor.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {donor.timestamp}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <Award className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No donations yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Campaign Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Campaign Details</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center justify-between py-3 border-b border-gray-100"
            >
              <span className="text-gray-600 font-medium">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                progress >= 100 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              }`}>
                {progress >= 100 ? 'Funded' : 'Active'}
              </span>
            </motion.div>

            {/* Category */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between py-3 border-b border-gray-100"
            >
              <span className="text-gray-600 font-medium">Category</span>
              <span className="text-gray-900 font-semibold">{campaign.category || 'Uncategorized'}</span>
            </motion.div>

            {/* Deadline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-center justify-between py-3 border-b border-gray-100"
            >
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Deadline
              </span>
              <span className="text-gray-900 font-semibold">
                {new Date(campaign.deadline).toLocaleDateString()}
              </span>
            </motion.div>

            {/* Beneficiary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between py-3"
            >
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Beneficiary
              </span>
              <code className="text-sm font-mono text-gray-900 font-semibold">
                {campaign.beneficiary.slice(0, 8)}...{campaign.beneficiary.slice(-6)}
              </code>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

CampaignDashboard.propTypes = {
  campaignId: PropTypes.string.isRequired,
};