import { useState, useMemo } from 'react';
import {
  FiPlus,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiEdit,
  FiEye,
  FiTarget,
  FiAward,
  FiActivity
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext';
import {
  formatDOT,
  calculateProgress,
  getDeadlineStatus,
  getCampaignStateColor,
  formatDate
} from '../utils/formatters';
import PageErrorBoundary from '../components/PageErrorBoundary';

const MyCampaignsPage = () => {
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaign();
  const { selectedAccount } = useWallet();
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false);

  // Filter campaigns created by the current user
  const myCampaigns = useMemo(() => {
    if (!selectedAccount || !campaigns) return [];
    return campaigns.filter(campaign => campaign.owner === selectedAccount.address);
  }, [campaigns, selectedAccount]);

  // Calculate stats for user's campaigns
  const campaignStats = useMemo(() => {
    const totalRaised = myCampaigns.reduce((sum, campaign) => sum + campaign.raised, 0n);
    const totalGoal = myCampaigns.reduce((sum, campaign) => sum + campaign.goal, 0n);
    const activeCampaigns = myCampaigns.filter(c => c.state === 'Active').length;
    const successfulCampaigns = myCampaigns.filter(c => c.state === 'Successful').length;

    return {
      totalCampaigns: myCampaigns.length,
      totalRaised,
      totalGoal,
      activeCampaigns,
      successfulCampaigns,
      successRate: myCampaigns.length > 0 ? (successfulCampaigns / myCampaigns.length) * 100 : 0
    };
  }, [myCampaigns]);

  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      await refreshCampaigns();
    } finally {
      setLocalLoading(false);
    }
  };

  if (!selectedAccount) {
    return (
      <div className="min-h-screen bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-yellow-500/10 border-2 border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-yellow-400 font-body font-bold mb-1">Wallet Not Connected</p>
                <p className="text-yellow-400/80 font-body">Please connect your wallet to view your campaigns.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-white/70 font-body">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-500/10 border-2 border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-400 font-body">Error loading campaigns: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stateColorClasses = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4 animate-fade-in">
            <div>
              <h1 className="text-5xl font-bold font-display bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-2">
                My Campaigns
              </h1>
              <p className="text-lg text-white/70 font-body">
                Manage and track your crowdfunding campaigns
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={localLoading}
                className="flex items-center gap-2 px-5 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white font-body font-semibold hover:border-primary/50 hover:bg-gray-800/50 transition-all duration-300 disabled:opacity-50"
              >
                <FiTrendingUp className={`w-5 h-5 ${localLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => navigate('/dashboard/create-campaign')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-body font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20"
              >
                <FiPlus className="w-5 h-5" />
                Create Campaign
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          {myCampaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <FiTarget className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-sm font-body font-semibold uppercase text-white/70">Total Campaigns</span>
                </div>
                <p className="text-3xl font-bold font-display text-white mb-1">{campaignStats.totalCampaigns}</p>
                <p className="text-sm text-white/60 font-body">{campaignStats.activeCampaigns} active</p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <FiTrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-sm font-body font-semibold uppercase text-white/70">Total Raised</span>
                </div>
                <p className="text-3xl font-bold font-display text-green-400 mb-1">
                  {formatDOT(campaignStats.totalRaised)} DOT
                </p>
                <p className="text-sm text-white/60 font-body">
                  of {formatDOT(campaignStats.totalGoal)} DOT goal
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <FiAward className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-sm font-body font-semibold uppercase text-white/70">Success Rate</span>
                </div>
                <p className="text-3xl font-bold font-display text-purple-400 mb-1">
                  {campaignStats.successRate.toFixed(1)}%
                </p>
                <p className="text-sm text-white/60 font-body">
                  {campaignStats.successfulCampaigns} successful
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <FiActivity className="w-6 h-6 text-orange-400" />
                  </div>
                  <span className="text-sm font-body font-semibold uppercase text-white/70">Avg Progress</span>
                </div>
                <p className="text-3xl font-bold font-display text-orange-400 mb-1">
                  {myCampaigns.length > 0
                    ? (myCampaigns.reduce((sum, c) => sum + calculateProgress(c.raised, c.goal), 0) / myCampaigns.length).toFixed(1)
                    : 0}%
                </p>
                <p className="text-sm text-white/60 font-body">across all campaigns</p>
              </div>
            </div>
          )}

          {/* Campaigns Grid */}
          {myCampaigns.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-12 text-center animate-fade-in">
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <FiPlus className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-3xl font-bold font-display text-white">No Campaigns Yet</h3>
                <p className="text-white/70 font-body max-w-md mx-auto">
                  You haven't created any campaigns yet. Start your first crowdfunding campaign to make a difference!
                </p>
                <button
                  onClick={() => navigate('/dashboard/create-campaign')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-body font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20"
                >
                  <FiPlus className="w-5 h-5" />
                  Create Your First Campaign
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {myCampaigns.map((campaign) => {
                const progress = calculateProgress(campaign.raised, campaign.goal);
                const deadlineStatus = getDeadlineStatus(campaign.deadline);
                const stateColor = getCampaignStateColor(campaign.state);

                return (
                  <div
                    key={campaign.id}
                    className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 hover:scale-105 transition-all duration-300 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <span className={`px-3 py-1 rounded-lg text-xs font-body font-bold border-2 ${stateColorClasses[stateColor] || stateColorClasses.gray}`}>
                        {campaign.state}
                      </span>
                      <span className="text-xs text-white/60 font-body font-mono">ID: {campaign.id}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold font-display text-white line-clamp-2">
                      {campaign.title}
                    </h3>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-body font-semibold text-white">
                          {formatDOT(campaign.raised)} DOT
                        </span>
                        <span className="text-sm font-body text-white/60">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-white/60 font-body mt-1">
                        Goal: {formatDOT(campaign.goal)} DOT
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                          <FiUsers className="w-4 h-4 text-white/60" />
                          <span className="text-xs text-white/60 font-body">Donors</span>
                        </div>
                        <p className="text-lg font-bold font-display text-white">0</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                          <FiClock className="w-4 h-4 text-white/60" />
                          <span className="text-xs text-white/60 font-body">Time Left</span>
                        </div>
                        <p className={`text-sm font-bold font-display ${deadlineStatus.color === 'red' ? 'text-red-400' : deadlineStatus.color === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {deadlineStatus.message}
                        </p>
                      </div>
                    </div>

                    {/* Deadline */}
                    <p className="text-xs text-white/60 font-body pt-2 border-t border-gray-700">
                      Deadline: {formatDate(campaign.deadline)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link
                        to={`/dashboard/campaign/${campaign.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white font-body font-semibold hover:border-primary/50 hover:bg-gray-800/50 transition-all duration-300"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </Link>
                      {campaign.state === 'Active' && (
                        <button
                          onClick={() => navigate(`/dashboard/campaign/${campaign.id}/edit`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/40 rounded-xl text-primary font-body font-semibold hover:border-primary hover:from-primary/30 hover:to-secondary/30 transition-all duration-300"
                        >
                          <FiEdit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyCampaignsPageWrapper = () => (
  <PageErrorBoundary pageName="My Campaigns">
    <MyCampaignsPage />
  </PageErrorBoundary>
);

MyCampaignsPageWrapper.displayName = 'MyCampaignsPageWrapper';

export default MyCampaignsPageWrapper;
