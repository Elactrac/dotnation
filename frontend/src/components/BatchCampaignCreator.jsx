import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBatchOperations } from '../contexts/BatchOperationsContext';
import { useWallet } from '../contexts/WalletContext';
import { generateDescription, generateTitles, detectFraud } from '../utils/aiApi';

const BatchCampaignCreator = () => {
  const { createCampaignsBatch, batchLoading, batchProgress, getMaxBatchSize } = useBatchOperations();
  const { selectedAccount } = useWallet();

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      title: '',
      description: '',
      goal: '',
      deadline: '',
      beneficiary: selectedAccount?.address || '',
      errors: {},
      aiLoading: false,
      fraudCheck: null,
    },
  ]);

  const [maxBatchSize, setMaxBatchSize] = useState(50);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState({});
  const [titleSuggestions, setTitleSuggestions] = useState({});
  const [notification, setNotification] = useState(null);

  // Load max batch size on mount
  React.useEffect(() => {
    getMaxBatchSize().then(setMaxBatchSize).catch(() => setMaxBatchSize(50));
  }, [getMaxBatchSize]);

  const showNotification = (title, description, type = 'info') => {
    setNotification({ title, description, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addCampaign = () => {
    if (campaigns.length >= maxBatchSize) {
      showNotification('Maximum Batch Size Reached', `You can only create ${maxBatchSize} campaigns at once`, 'warning');
      return;
    }

    setCampaigns([
      ...campaigns,
      {
        id: Date.now(),
        title: '',
        description: '',
        goal: '',
        deadline: '',
        beneficiary: selectedAccount?.address || '',
        errors: {},
        aiLoading: false,
        fraudCheck: null,
      },
    ]);
  };

  const removeCampaign = (id) => {
    if (campaigns.length === 1) {
      showNotification('Cannot Remove', 'You must have at least one campaign', 'warning');
      return;
    }
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  const updateCampaign = (id, field, value) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, [field]: value, errors: { ...c.errors, [field]: null } } : c
    ));
  };

  // AI Feature: Generate description
  const handleGenerateDescription = async (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign.title) {
      showNotification('Title Required', 'Please enter a campaign title first', 'warning');
      return;
    }

    setCampaigns(campaigns.map(c => 
      c.id === campaignId ? { ...c, aiLoading: true } : c
    ));

    try {
      const result = await generateDescription(campaign.title);
      updateCampaign(campaignId, 'description', result.description);
      showNotification('AI Generated', 'Description created successfully!', 'success');
    } catch (error) {
      showNotification('Generation Failed', 'Could not generate description', 'error');
      console.error('AI generation error:', error);
    } finally {
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, aiLoading: false } : c
      ));
    }
  };

  // AI Feature: Generate title suggestions
  const handleGenerateTitles = async (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    
    setCampaigns(campaigns.map(c => 
      c.id === campaignId ? { ...c, aiLoading: true } : c
    ));

    try {
      const result = await generateTitles(campaign.title || 'help community', 'general');
      setTitleSuggestions({ ...titleSuggestions, [campaignId]: result.titles });
      setShowTitleSuggestions({ ...showTitleSuggestions, [campaignId]: true });
      showNotification('Titles Generated', 'Select a title from the suggestions', 'success');
    } catch (error) {
      showNotification('Generation Failed', 'Could not generate titles', 'error');
      console.error('AI generation error:', error);
    } finally {
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, aiLoading: false } : c
      ));
    }
  };

  // AI Feature: Fraud detection
  const handleFraudCheck = async (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign.title || !campaign.description) {
      showNotification('Incomplete Data', 'Please enter title and description first', 'warning');
      return;
    }

    setCampaigns(campaigns.map(c => 
      c.id === campaignId ? { ...c, aiLoading: true } : c
    ));

    try {
      const result = await detectFraud({
        title: campaign.title,
        description: campaign.description,
        goal: campaign.goal,
        beneficiary: campaign.beneficiary,
        category: 'general',
      });
      
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, fraudCheck: result } : c
      ));
      
      const statusType = result.riskLevel === 'low' ? 'success' : result.riskLevel === 'high' ? 'error' : 'warning';
      showNotification(`Risk: ${result.riskLevel.toUpperCase()}`, `Score: ${result.riskScore}/100`, statusType);
    } catch (error) {
      showNotification('Check Failed', 'Could not perform fraud detection', 'error');
      console.error('Fraud detection error:', error);
    } finally {
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, aiLoading: false } : c
      ));
    }
  };

  const selectTitleSuggestion = (campaignId, title) => {
    updateCampaign(campaignId, 'title', title);
    setShowTitleSuggestions({ ...showTitleSuggestions, [campaignId]: false });
  };

  const validateCampaign = (campaign) => {
    const errors = {};

    if (!campaign.title || campaign.title.trim().length === 0) {
      errors.title = 'Title is required';
    } else if (campaign.title.length > 100) {
      errors.title = 'Title must be 100 characters or less';
    }

    if (campaign.description.length > 1000) {
      errors.description = 'Description must be 1000 characters or less';
    }

    const goalNum = parseFloat(campaign.goal);
    if (!campaign.goal || isNaN(goalNum) || goalNum <= 0) {
      errors.goal = 'Goal must be a positive number';
    }

    if (!campaign.deadline) {
      errors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(campaign.deadline);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      if (deadlineDate <= oneHourFromNow) {
        errors.deadline = 'Deadline must be at least 1 hour from now';
      } else if (deadlineDate > oneYearFromNow) {
        errors.deadline = 'Deadline cannot be more than 1 year from now';
      }
    }

    if (!campaign.beneficiary || campaign.beneficiary.length === 0) {
      errors.beneficiary = 'Beneficiary address is required';
    }

    return errors;
  };

  const validateAllCampaigns = () => {
    let hasErrors = false;
    const updatedCampaigns = campaigns.map(campaign => {
      const errors = validateCampaign(campaign);
      if (Object.keys(errors).length > 0) {
        hasErrors = true;
      }
      return { ...campaign, errors };
    });

    setCampaigns(updatedCampaigns);
    return !hasErrors;
  };

  const handleBatchCreate = async () => {
    if (!selectedAccount) {
      showNotification('Wallet Not Connected', 'Please connect your wallet first', 'error');
      return;
    }

    if (!validateAllCampaigns()) {
      showNotification('Validation Failed', 'Please fix the errors in your campaigns', 'error');
      return;
    }

    try {
      const formattedCampaigns = campaigns.map(campaign => ({
        title: campaign.title.trim(),
        description: campaign.description.trim(),
        goal: BigInt(parseFloat(campaign.goal) * 1_000_000_000_000),
        deadline: new Date(campaign.deadline).getTime(),
        beneficiary: campaign.beneficiary,
      }));

      const result = await createCampaignsBatch(formattedCampaigns);

      if (result.failed === 0) {
        setCampaigns([
          {
            id: Date.now(),
            title: '',
            description: '',
            goal: '',
            deadline: '',
            beneficiary: selectedAccount?.address || '',
            errors: {},
            aiLoading: false,
            fraudCheck: null,
          },
        ]);
      }
    } catch (error) {
      console.error('Batch creation error:', error);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'error': return 'bg-red-500/10 border-red-500/30 text-red-400';
      default: return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`p-4 rounded-xl border backdrop-blur-lg ${getNotificationStyles(notification.type)} shadow-xl min-w-[300px]`}>
              <div className="font-bold text-lg mb-1">{notification.title}</div>
              <div className="text-sm opacity-90">{notification.description}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
              Batch Campaign Creator
            </h1>
            <p className="text-gray-400">
              Create multiple campaigns in a single transaction (up to {maxBatchSize}) with AI assistance
            </p>
          </div>
          <div className="px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl backdrop-blur-sm">
            <div className="text-2xl font-bold text-white">{campaigns.length} / {maxBatchSize}</div>
            <div className="text-xs text-gray-400 text-center">Campaigns</div>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <AnimatePresence>
        {batchLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <div className="font-bold text-white">Creating Campaigns...</div>
              </div>
              <div className="text-sm text-gray-300 mb-3">
                Processing {batchProgress.current} of {batchProgress.total} campaigns
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Cards */}
      <div className="space-y-6 mb-6">
        <AnimatePresence>
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative group"
            >
              <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
                {/* Campaign Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center font-bold text-white">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-white">Campaign #{index + 1}</h3>
                  </div>
                  <div className="flex gap-2">
                    {campaign.fraudCheck && (
                      <div className={`px-3 py-1 rounded-lg border text-xs font-bold ${getRiskColor(campaign.fraudCheck.riskLevel)}`}>
                        Risk: {campaign.fraudCheck.riskLevel.toUpperCase()} ({campaign.fraudCheck.riskScore}/100)
                      </div>
                    )}
                    {campaigns.length > 1 && (
                      <button
                        onClick={() => removeCampaign(campaign.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        aria-label="Remove campaign"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Title Field with AI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Campaign Title
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter campaign title (max 100 characters)"
                        value={campaign.title}
                        onChange={(e) => updateCampaign(campaign.id, 'title', e.target.value)}
                        maxLength={100}
                        className={`flex-1 px-4 py-3 bg-gray-900/50 border ${campaign.errors.title ? 'border-red-500/50' : 'border-gray-700/50'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors`}
                      />
                      <button
                        onClick={() => handleGenerateTitles(campaign.id)}
                        disabled={campaign.aiLoading}
                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Generate AI titles"
                      >
                        {campaign.aiLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {campaign.errors.title && (
                      <p className="text-red-400 text-sm mt-1">{campaign.errors.title}</p>
                    )}
                    
                    {/* Title Suggestions */}
                    <AnimatePresence>
                      {showTitleSuggestions[campaign.id] && titleSuggestions[campaign.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-2"
                        >
                          {titleSuggestions[campaign.id].map((title, idx) => (
                            <motion.button
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => selectTitleSuggestion(campaign.id, title)}
                              className="w-full text-left px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-gray-300 transition-colors"
                            >
                              {title}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Description Field with AI */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Description
                      </label>
                      <button
                        onClick={() => handleGenerateDescription(campaign.id)}
                        disabled={campaign.aiLoading || !campaign.title}
                        className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {campaign.aiLoading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Generate with AI</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      placeholder="Enter campaign description (max 1000 characters)"
                      value={campaign.description}
                      onChange={(e) => updateCampaign(campaign.id, 'description', e.target.value)}
                      maxLength={1000}
                      rows={3}
                      className={`w-full px-4 py-3 bg-gray-900/50 border ${campaign.errors.description ? 'border-red-500/50' : 'border-gray-700/50'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none`}
                    />
                    {campaign.errors.description && (
                      <p className="text-red-400 text-sm mt-1">{campaign.errors.description}</p>
                    )}
                  </div>

                  {/* Goal and Deadline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Funding Goal (DOT)
                      </label>
                      <input
                        type="number"
                        placeholder="1000"
                        value={campaign.goal}
                        onChange={(e) => updateCampaign(campaign.id, 'goal', e.target.value)}
                        min="0"
                        step="0.01"
                        className={`w-full px-4 py-3 bg-gray-900/50 border ${campaign.errors.goal ? 'border-red-500/50' : 'border-gray-700/50'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors`}
                      />
                      {campaign.errors.goal && (
                        <p className="text-red-400 text-sm mt-1">{campaign.errors.goal}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Deadline
                      </label>
                      <input
                        type="datetime-local"
                        value={campaign.deadline}
                        onChange={(e) => updateCampaign(campaign.id, 'deadline', e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-900/50 border ${campaign.errors.deadline ? 'border-red-500/50' : 'border-gray-700/50'} rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-colors`}
                      />
                      {campaign.errors.deadline && (
                        <p className="text-red-400 text-sm mt-1">{campaign.errors.deadline}</p>
                      )}
                    </div>
                  </div>

                  {/* Beneficiary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Beneficiary Address
                    </label>
                    <input
                      type="text"
                      placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                      value={campaign.beneficiary}
                      onChange={(e) => updateCampaign(campaign.id, 'beneficiary', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-900/50 border ${campaign.errors.beneficiary ? 'border-red-500/50' : 'border-gray-700/50'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors font-mono text-sm`}
                    />
                    {campaign.errors.beneficiary && (
                      <p className="text-red-400 text-sm mt-1">{campaign.errors.beneficiary}</p>
                    )}
                  </div>

                  {/* Fraud Check Button */}
                  <div>
                    <button
                      onClick={() => handleFraudCheck(campaign.id)}
                      disabled={campaign.aiLoading || !campaign.title || !campaign.description}
                      className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {campaign.aiLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>Run AI Fraud Check</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Fraud Check Results */}
                  <AnimatePresence>
                    {campaign.fraudCheck && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-lg border ${getRiskColor(campaign.fraudCheck.riskLevel)}`}
                      >
                        <div className="font-bold mb-2">Fraud Analysis Results</div>
                        {campaign.fraudCheck.flags.length > 0 && (
                          <div className="mb-2">
                            <div className="text-sm font-semibold mb-1">Red Flags:</div>
                            <ul className="text-xs space-y-1 ml-4">
                              {campaign.fraudCheck.flags.map((flag, idx) => (
                                <li key={idx} className="list-disc">{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {campaign.fraudCheck.recommendations.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold mb-1">Recommendations:</div>
                            <ul className="text-xs space-y-1 ml-4">
                              {campaign.fraudCheck.recommendations.map((rec, idx) => (
                                <li key={idx} className="list-disc">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row justify-between gap-4 mb-6"
      >
        <button
          onClick={addCampaign}
          disabled={campaigns.length >= maxBatchSize || batchLoading}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-gray-600/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Another Campaign</span>
        </button>

        <button
          onClick={handleBatchCreate}
          disabled={!selectedAccount || campaigns.length === 0 || batchLoading}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
        >
          {batchLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating Campaigns...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Create {campaigns.length} Campaign{campaigns.length > 1 ? 's' : ''}</span>
            </>
          )}
        </button>
      </motion.div>

      {/* Gas Savings Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-bold text-green-400 text-lg mb-1">Gas Savings!</div>
            <div className="text-gray-300 text-sm">
              Creating {campaigns.length} campaigns in batch saves approximately{' '}
              <span className="font-bold text-green-400">{Math.round((campaigns.length - 1) * 20)}%</span>{' '}
              on gas fees compared to individual transactions.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BatchCampaignCreator;
