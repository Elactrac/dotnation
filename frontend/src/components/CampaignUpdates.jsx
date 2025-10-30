import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, User, MessageSquare, CheckCircle } from 'lucide-react';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';

export const CampaignUpdates = ({ campaignId }) => {
  const { campaigns, addCampaignUpdate, deleteCampaignUpdate } = useCampaign();
  const { selectedAccount } = useWallet();
  const [newUpdate, setNewUpdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', type: 'success' });

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const campaign = campaigns.find(c => c.id === campaignId);
  const isCreator = campaign?.creator === selectedAccount?.address;

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;

    setIsSubmitting(true);
    try {
      await addCampaignUpdate(campaignId, {
        content: newUpdate.trim(),
        timestamp: Date.now(),
        author: selectedAccount.address,
      });

      setNewUpdate('');
      setToast({ show: true, title: 'Update posted successfully!', type: 'success' });
    } catch (error) {
      setToast({ show: true, title: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    try {
      await deleteCampaignUpdate(campaignId, updateId);
      setToast({ show: true, title: 'Update deleted', type: 'success' });
    } catch (error) {
      setToast({ show: true, title: error.message, type: 'error' });
    }
  };

  if (!campaign) return null;

  // Generate avatar color from address
  const getAvatarColor = (address) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500'
    ];
    const index = address ? address.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`${
              toast.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-red-500 to-pink-500'
            } text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-2`}>
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{toast.title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <MessageSquare className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">Campaign Updates</h2>
      </motion.div>

      {/* Add Update Form (Only for Creator) */}
      {isCreator && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg"
        >
          <div className="space-y-4">
            <textarea
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              placeholder="Share an update about your campaign..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddUpdate}
                disabled={!newUpdate.trim() || isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all ${
                  !newUpdate.trim() || isSubmitting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Post Update
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Updates List */}
      <div className="space-y-4">
        <AnimatePresence>
          {campaign.updates && campaign.updates.length > 0 ? (
            campaign.updates.map((update, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(update.author)} flex items-center justify-center`}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      {/* Author Info */}
                      <div>
                        <p className="font-semibold text-gray-900">
                          <code className="text-sm">
                            {update.author.slice(0, 8)}...{update.author.slice(-6)}
                          </code>
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(update.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Delete Button (Only for Creator) */}
                    {isCreator && (
                      <button
                        onClick={() => handleDeleteUpdate(index)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Delete update"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4" />

                  {/* Content */}
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {update.content}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300"
            >
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No updates yet</p>
              <p className="text-gray-400 text-sm mt-2">
                {isCreator ? 'Be the first to share an update!' : 'Check back later for updates'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

CampaignUpdates.propTypes = {
  campaignId: PropTypes.number.isRequired,
};