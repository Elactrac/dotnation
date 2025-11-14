import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decodeAddress } from '@polkadot/util-crypto';
import { u8aEq } from '@polkadot/util';
import { useBatchOperations } from '../contexts/BatchOperationsContext';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';

const BatchWithdrawal = () => {
  const { withdrawFundsBatch, batchLoading, batchProgress } = useBatchOperations();
  const { campaigns, loading: campaignsLoading } = useCampaign();
  const { selectedAccount } = useWallet();

  const [selectedCampaigns, setSelectedCampaigns] = useState(new Set());
  const [eligibleCampaigns, setEligibleCampaigns] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!campaigns || !selectedAccount) return;

    // Helper function to compare addresses regardless of SS58 format
    const addressesMatch = (addr1, addr2) => {
      try {
        const decoded1 = decodeAddress(addr1);
        const decoded2 = decodeAddress(addr2);
        return u8aEq(decoded1, decoded2);
      } catch (error) {
        console.error('Error comparing addresses:', error);
        return false;
      }
    };

    // Filter campaigns that are eligible for withdrawal
    const eligible = campaigns.filter(campaign => {
      const isOwner = addressesMatch(campaign.owner, selectedAccount.address);
      const isSuccessful = campaign.state === 'Successful';
      const notWithdrawn = campaign.state !== 'Withdrawn';
      const hasBalance = campaign.raised > 0;

      return isOwner && isSuccessful && notWithdrawn && hasBalance;
    });

    setEligibleCampaigns(eligible);
  }, [campaigns, selectedAccount]);

  useEffect(() => {
    // Calculate total amount from selected campaigns
    const total = eligibleCampaigns
      .filter(c => selectedCampaigns.has(c.id))
      .reduce((sum, c) => sum + BigInt(c.raised), BigInt(0));

    setTotalAmount(total);
  }, [selectedCampaigns, eligibleCampaigns]);

  const showNotification = (title, description, type = 'info') => {
    setNotification({ title, description, type });
    // Auto-dismiss after 5 seconds (increased from 3s)
    setTimeout(() => setNotification(null), 5000);
  };

  const toggleCampaign = (campaignId) => {
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId);
    } else {
      newSelected.add(campaignId);
    }
    setSelectedCampaigns(newSelected);
  };

  const selectAll = () => {
    if (selectedCampaigns.size === eligibleCampaigns.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(eligibleCampaigns.map(c => c.id)));
    }
  };

  const handleBatchWithdraw = async () => {
    if (selectedCampaigns.size === 0) {
      showNotification('No Campaigns Selected', 'Please select at least one campaign to withdraw from', 'warning');
      return;
    }

    const selectedCount = selectedCampaigns.size;
    
    // Inform user about batch splitting for large selections
    if (selectedCount > 5) {
      showNotification(
        'Processing Large Batch', 
        `Your ${selectedCount} campaigns will be processed in multiple batches to ensure transaction success`, 
        'info'
      );
    }

    try {
      const campaignIds = Array.from(selectedCampaigns);
      const result = await withdrawFundsBatch(campaignIds);

      if (result.failed === 0) {
        // Clear selection on success
        setSelectedCampaigns(new Set());
        showNotification(
          'All Withdrawals Complete!',
          `Successfully withdrew from ${result.successful} campaign${result.successful > 1 ? 's' : ''}`,
          'success'
        );
      } else {
        showNotification(
          'Partial Success',
          `${result.successful} succeeded, ${result.failed} failed. Please check and retry failed campaigns.`,
          'warning'
        );
      }
    } catch (error) {
      console.error('Batch withdrawal error:', error);
      showNotification(
        'Withdrawal Error',
        error.message || 'An unexpected error occurred',
        'error'
      );
    }
  };

  const formatBalance = (balance) => {
    return (Number(balance) / 1_000_000_000_000).toFixed(4);
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'error': return 'bg-red-500/10 border-red-500/30 text-red-400';
      default: return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  if (!selectedAccount) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div className="font-bold text-yellow-400 text-lg mb-1">Wallet Not Connected</div>
              <div className="text-gray-300 text-sm">
                Please connect your wallet to view and withdraw from your campaigns.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (campaignsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-lg">Loading your campaigns...</p>
        </motion.div>
      </div>
    );
  }

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
            <div className={`p-4 rounded-xl border backdrop-blur-lg ${getNotificationStyles(notification.type)} shadow-xl min-w-[300px] relative`}>
              <button
                onClick={() => setNotification(null)}
                className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="font-bold text-lg mb-1 pr-6">{notification.title}</div>
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Batch Withdrawal
        </h1>
        <p className="text-gray-400">
          Withdraw funds from multiple successful campaigns in a single transaction
        </p>
      </motion.div>

      {eligibleCampaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-bold text-blue-400 text-lg mb-1">No Eligible Campaigns</div>
              <div className="text-gray-300 text-sm">
                You don&apos;t have any successful campaigns ready for withdrawal.
                Campaigns must reach their funding goal before funds can be withdrawn.
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Eligible Campaigns</div>
              <div className="text-3xl font-bold text-white mb-1">{eligibleCampaigns.length}</div>
              <div className="text-xs text-gray-400">Ready to withdraw</div>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Selected</div>
              <div className="text-3xl font-bold text-white mb-1">{selectedCampaigns.size}</div>
              <div className="text-xs text-gray-400">
                {selectedCampaigns.size === 0
                  ? 'None selected'
                  : `${Math.round((selectedCampaigns.size / eligibleCampaigns.length) * 100)}% selected`}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Total Amount</div>
              <div className="text-3xl font-bold text-white mb-1">{formatBalance(totalAmount)}</div>
              <div className="text-xs text-gray-400">DOT to be withdrawn</div>
            </div>
          </motion.div>

          {/* Smart Batch Info Banner */}
          <AnimatePresence>
            {selectedCampaigns.size > 5 && !batchLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-bold text-blue-400 text-lg mb-1">Smart Batch Processing</div>
                      <div className="text-gray-300 text-sm">
                        You&apos;ve selected {selectedCampaigns.size} campaigns. To ensure transaction success, 
                        these will be automatically split into smaller batches (~5 campaigns per batch).
                        You&apos;ll need to approve {Math.ceil(selectedCampaigns.size / 5)} transaction{Math.ceil(selectedCampaigns.size / 5) > 1 ? 's' : ''}.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                    <div className="font-bold text-white">Processing Withdrawals...</div>
                  </div>
                  <div className="text-sm text-gray-300 mb-3">
                    Please wait while we process {selectedCampaigns.size} withdrawal{selectedCampaigns.size > 1 ? 's' : ''}.
                    {selectedCampaigns.size > 5 && ` Processing in batches of ~5 campaigns.`}
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: batchProgress.total > 0 ? `${(batchProgress.current / batchProgress.total) * 100}%` : '0%' }}
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-2 text-right">
                    {batchProgress.current} / {batchProgress.total} withdrawals
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Campaigns Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 overflow-hidden rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm"
          >
            {/* Table Header */}
            <div className="p-4 bg-gray-800/80 border-b border-gray-700/50">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.size === eligibleCampaigns.length && eligibleCampaigns.length > 0}
                    onChange={selectAll}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900 cursor-pointer"
                  />
                  <span className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    Select All ({eligibleCampaigns.length})
                  </span>
                </label>

                <button
                  onClick={handleBatchWithdraw}
                  disabled={selectedCampaigns.size === 0 || batchLoading}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {batchLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Withdrawing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Withdraw Selected ({selectedCampaigns.size})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campaign</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Raised</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Goal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Beneficiary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  <AnimatePresence>
                    {eligibleCampaigns.map((campaign, index) => (
                      <motion.tr
                        key={campaign.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => toggleCampaign(campaign.id)}
                        className="hover:bg-gray-700/30 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCampaigns.has(campaign.id)}
                            onChange={() => toggleCampaign(campaign.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-white">{campaign.title}</div>
                          <div className="text-sm text-gray-400">ID: {campaign.id}</div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="font-bold text-green-400">{formatBalance(campaign.raised)} DOT</div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="text-white">{formatBalance(campaign.goal)} DOT</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold border border-green-500/30">
                            Successful
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs font-mono text-gray-400">
                            {campaign.beneficiary.slice(0, 8)}...{campaign.beneficiary.slice(-6)}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Gas Savings Info */}
          <AnimatePresence>
            {selectedCampaigns.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <div className="font-bold text-green-400 text-lg mb-1">Gas Savings!</div>
                    <div className="text-gray-300 text-sm">
                      {selectedCampaigns.size <= 5 ? (
                        <>
                          Withdrawing from {selectedCampaigns.size} campaigns in a single batch saves approximately{' '}
                          <span className="font-bold text-green-400">{Math.round((selectedCampaigns.size - 1) * 15)}%</span>{' '}
                          on gas fees compared to individual transactions.
                        </>
                      ) : (
                        <>
                          Processing {selectedCampaigns.size} campaigns in {Math.ceil(selectedCampaigns.size / 5)} batch{Math.ceil(selectedCampaigns.size / 5) > 1 ? 'es' : ''} saves approximately{' '}
                          <span className="font-bold text-green-400">
                            {Math.round((selectedCampaigns.size - Math.ceil(selectedCampaigns.size / 5)) * 12)}%
                          </span>{' '}
                          on gas fees compared to {selectedCampaigns.size} individual transactions.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default BatchWithdrawal;
