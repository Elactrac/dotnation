import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  FiHeart,
  FiUsers,
  FiTrendingUp,
  FiMessageSquare,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiCopy,
  FiCalendar,
  FiTarget,
  FiCheckCircle
} from 'react-icons/fi';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext';
import { DonationInterface } from '../components/DonationInterface.jsx';
import {
  formatDOT,
  formatDate,
  formatDateTime,
  shortenAddress,
  calculateProgress,
  getDeadlineStatus,
  getCampaignStateColor
} from '../utils/formatters';

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const { getCampaignDetails, withdrawFunds, isLoading, error } = useCampaign();
  const { selectedAccount } = useWallet();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [showToast, setShowToast] = useState(null);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const details = await getCampaignDetails(id);
        if (details) {
          setCampaign(details.campaign);
          setDonations(details.donations || []);
        }
      } catch (err) {
        setShowToast({
          type: 'error',
          message: err.message
        });
      }
    };

    if (id) {
      fetchCampaignDetails();
    }
  }, [id, getCampaignDetails]);

  const handleWithdraw = async () => {
    if (!campaign || !selectedAccount) return;

    setIsWithdrawing(true);
    try {
      await withdrawFunds(id);
      setShowToast({
        type: 'success',
        message: 'Funds withdrawn successfully!'
      });
      // Refresh campaign details
      const details = await getCampaignDetails(id);
      setCampaign(details.campaign);
    } catch (err) {
      setShowToast({
        type: 'error',
        message: err.message
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = campaign ? `Support ${campaign.title} on DotNation!` : 'Check out this campaign on DotNation!';

    try {
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'copy':
          await navigator.clipboard.writeText(url);
          setShowToast({
            type: 'success',
            message: 'Link copied to clipboard!'
          });
          break;
        default:
          break;
      }
    } catch (err) {
      setShowToast({
        type: 'error',
        message: 'Failed to share campaign'
      });
    }
  };

  const campaignStats = useMemo(() => {
    if (!campaign) return null;

    const progress = calculateProgress(campaign.raised, campaign.goal);
    const deadlineStatus = getDeadlineStatus(campaign.deadline);
    const stateColor = getCampaignStateColor(campaign.state);

    return {
      progress,
      deadlineStatus,
      stateColor,
      formattedGoal: formatDOT(campaign.goal),
      formattedRaised: formatDOT(campaign.raised),
      isOwner: selectedAccount && selectedAccount.address === campaign.owner,
      canWithdraw: selectedAccount && campaign.owner === selectedAccount.address &&
        (campaign.state === 'Successful' || (campaign.state === 'Active' && deadlineStatus.daysLeft === 0)) &&
        campaign.state !== 'Withdrawn'
    };
  }, [campaign, selectedAccount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-white/70 font-body">Loading campaign details...</p>
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
              <p className="text-red-400 font-body">Error loading campaign: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-yellow-500/10 border-2 border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-yellow-400 font-body">Campaign not found</p>
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
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`px-6 py-4 rounded-xl border-2 backdrop-blur-xl ${
            showToast.type === 'success' 
              ? 'bg-green-500/20 border-green-500/50 text-green-400' 
              : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}>
            <p className="font-body font-semibold">{showToast.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Image */}
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src={campaign.imageUrl || 'https://via.placeholder.com/800x400?text=Campaign+Image'}
                alt={campaign.title}
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            {/* Campaign Header */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 transition-all duration-300">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <h1 className="text-4xl font-bold font-display text-white">{campaign.title}</h1>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-xl border-2 font-body font-semibold ${stateColorClasses[campaignStats?.stateColor] || stateColorClasses.gray}`}>
                    {campaign.state}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="p-2 text-white/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                      title="Share on Twitter"
                    >
                      <FiTwitter className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="p-2 text-white/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                      title="Share on Facebook"
                    >
                      <FiFacebook className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="p-2 text-white/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                      title="Share on LinkedIn"
                    >
                      <FiLinkedin className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="p-2 text-white/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                      title="Copy link"
                    >
                      <FiCopy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaign Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-xl p-4 border-2 border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-body font-semibold uppercase text-white/70">Funds Raised</span>
                  </div>
                  <p className="text-2xl font-bold font-display text-green-400">{campaignStats?.formattedRaised} DOT</p>
                  <p className="text-sm text-white/60 font-body">of {campaignStats?.formattedGoal} DOT goal</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 border-2 border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTarget className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-body font-semibold uppercase text-white/70">Progress</span>
                  </div>
                  <p className="text-2xl font-bold font-display text-blue-400">{campaignStats?.progress.toFixed(1)}%</p>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(campaignStats?.progress || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 border-2 border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-body font-semibold uppercase text-white/70">Time Left</span>
                  </div>
                  <p className="text-2xl font-bold font-display text-yellow-400">
                    {campaignStats?.deadlineStatus.message}
                  </p>
                  <p className="text-sm text-white/60 font-body">Deadline: {formatDate(campaign.deadline)}</p>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-gray-700">
                <div>
                  <p className="text-sm font-body font-semibold uppercase text-white/60 mb-1">Created by</p>
                  <p className="text-white font-body font-mono">{shortenAddress(campaign.owner)}</p>
                </div>
                <div>
                  <p className="text-sm font-body font-semibold uppercase text-white/60 mb-1">Beneficiary</p>
                  <p className="text-white font-body font-mono">{shortenAddress(campaign.beneficiary)}</p>
                </div>
                <div>
                  <p className="text-sm font-body font-semibold uppercase text-white/60 mb-1">Total Donors</p>
                  <div className="flex items-center gap-2">
                    <FiUsers className="w-5 h-5 text-primary" />
                    <p className="text-white font-body font-bold">{donations.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6">
              {/* Tab Headers */}
              <div className="flex flex-wrap gap-2 border-b-2 border-gray-700 pb-4 mb-6">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-body font-semibold transition-all duration-300 ${
                    activeTab === 'about'
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FiHeart className="w-4 h-4" />
                  About
                </button>
                <button
                  onClick={() => setActiveTab('updates')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-body font-semibold transition-all duration-300 ${
                    activeTab === 'updates'
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FiTrendingUp className="w-4 h-4" />
                  Updates
                </button>
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-body font-semibold transition-all duration-300 ${
                    activeTab === 'discussion'
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FiMessageSquare className="w-4 h-4" />
                  Discussion
                </button>
                <button
                  onClick={() => setActiveTab('donors')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-body font-semibold transition-all duration-300 ${
                    activeTab === 'donors'
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FiUsers className="w-4 h-4" />
                  Donors ({donations.length})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'about' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold font-display text-white mb-4">About this campaign</h2>
                  <p className="text-white/80 font-body leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
                </div>
              )}

              {activeTab === 'updates' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold font-display text-white mb-4">Campaign Updates</h2>
                  <p className="text-white/60 font-body italic">
                    No updates yet. Campaign updates will appear here as the creator shares progress.
                  </p>
                </div>
              )}

              {activeTab === 'discussion' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold font-display text-white mb-4">Discussion</h2>
                  <p className="text-white/60 font-body italic">
                    Comments and discussion feature coming soon. Stay tuned!
                  </p>
                </div>
              )}

              {activeTab === 'donors' && (
                <div className="animate-fade-in space-y-4">
                  <h2 className="text-2xl font-bold font-display text-white mb-4">Recent Donations</h2>
                  {donations.length > 0 ? (
                    donations.slice(0, 10).map((donation, index) => (
                      <div key={index} className="bg-gray-900/50 rounded-xl p-4 border-2 border-gray-700 hover:border-primary/50 transition-all duration-300">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                              {shortenAddress(donation.donor)[0]}
                            </div>
                            <div>
                              <p className="text-white font-body font-semibold font-mono">{shortenAddress(donation.donor)}</p>
                              <p className="text-sm text-white/60 font-body">
                                {formatDateTime(donation.timestamp)}
                              </p>
                            </div>
                          </div>
                          <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-body font-bold border-2 border-green-500/30">
                            {formatDOT(donation.amount)} DOT
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FiHeart className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60 font-body italic">
                        No donations yet. Be the first to support this campaign!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Withdraw Button for Campaign Owner */}
            {campaignStats?.canWithdraw && (
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-body font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isWithdrawing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing withdrawal...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5" />
                    Withdraw Funds
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Column - Donation Interface */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <DonationInterface campaignId={id} campaign={campaign} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsPage;
