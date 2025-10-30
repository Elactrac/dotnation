import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCampaign } from '../contexts/CampaignContext';
import { CampaignCard } from './CampaignCard';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, Plus } from 'lucide-react';

export const CampaignList = () => {
  const { campaigns, isLoading, error, fetchCampaigns } = useCampaign();

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3"
      >
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">Error Loading Campaigns</p>
          <p className="text-red-700">{error}</p>
        </div>
      </motion.div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-12 max-w-2xl mx-auto border border-purple-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No Active Campaigns Found</h2>
          <p className="text-gray-600 text-lg mb-6">Be the first to create a campaign!</p>
          <Link
            to="/create-campaign"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Campaign
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Active Campaigns</h1>
        <Link
          to="/create-campaign"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </Link>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <CampaignCard campaign={campaign} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CampaignList;