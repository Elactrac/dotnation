import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Save, X, Calendar, Target, User, FileText } from 'lucide-react';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';

export const CampaignEdit = ({ campaignId, onSuccess, onCancel }) => {
  const { campaigns, updateCampaign } = useCampaign();
  const { selectedAccount } = useWallet();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    beneficiary: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', description: '', type: 'success' });

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setFormData({
        title: campaign.title,
        description: campaign.description,
        goal: (campaign.goal / 1_000_000_000_000).toString(), // Convert from femto DOT
        deadline: new Date(campaign.deadline).toISOString().slice(0, 16),
        beneficiary: campaign.beneficiary,
      });
    }
  }, [campaignId, campaigns]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.goal || formData.goal <= 0) {
      newErrors.goal = 'Goal must be greater than 0';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    if (!formData.beneficiary.trim()) {
      newErrors.beneficiary = 'Beneficiary address is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const deadlineTimestamp = new Date(formData.deadline).getTime();
      const goalAmount = Math.floor(parseFloat(formData.goal) * 1_000_000_000_000); // Convert to femto DOT

      await updateCampaign(campaignId, {
        ...formData,
        goal: goalAmount,
        deadline: deadlineTimestamp,
      });

      setToast({
        show: true,
        title: 'Success',
        description: 'Your campaign has been updated successfully.',
        type: 'success'
      });

      onSuccess();
    } catch (error) {
      setToast({
        show: true,
        title: 'Error',
        description: error.message,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3"
      >
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">Campaign Not Found</p>
          <p className="text-sm text-red-700 mt-1">The requested campaign could not be found.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
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
            } text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl max-w-md`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{toast.title}</p>
                  <p className="text-sm opacity-90 mt-1">{toast.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            Campaign Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter campaign title"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.title 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          />
          {errors.title && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-2 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.title}
            </motion.p>
          )}
        </motion.div>

        {/* Description Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your campaign"
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
              errors.description 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          />
          {errors.description && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-2 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.description}
            </motion.p>
          )}
        </motion.div>

        {/* Goal Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4" />
            Funding Goal (DOT)
          </label>
          <input
            type="number"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.goal 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          />
          {errors.goal && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-2 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.goal}
            </motion.p>
          )}
        </motion.div>

        {/* Deadline Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Campaign Deadline
          </label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.deadline 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          />
          {errors.deadline && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-2 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.deadline}
            </motion.p>
          )}
        </motion.div>

        {/* Beneficiary Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4" />
            Beneficiary Address
          </label>
          <input
            type="text"
            name="beneficiary"
            value={formData.beneficiary}
            onChange={handleChange}
            placeholder="Enter the beneficiary's Polkadot address"
            className={`w-full px-4 py-3 rounded-xl border-2 font-mono text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.beneficiary 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          />
          {errors.beneficiary && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-2 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.beneficiary}
            </motion.p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-4 pt-4"
        >
          <button
            type="submit"
            disabled={!selectedAccount || isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all ${
              !selectedAccount || isSubmitting
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
                  <Save className="w-5 h-5" />
                </motion.div>
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Campaign
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </motion.div>

        {/* Wallet Warning */}
        {!selectedAccount && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Wallet Not Connected</p>
              <p className="text-sm text-amber-700 mt-1">Please connect your wallet to update the campaign.</p>
            </div>
          </motion.div>
        )}
      </form>
    </>
  );
};

CampaignEdit.propTypes = {
  campaignId: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};