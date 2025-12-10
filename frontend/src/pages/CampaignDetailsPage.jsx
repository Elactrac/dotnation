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
  FiCheckCircle,
  FiXCircle,
  FiDollarSign
} from 'react-icons/fi';
import { decodeAddress } from '@polkadot/util-crypto';
import { u8aEq } from '@polkadot/util';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext';
import { DonationInterface } from '../components/DonationInterface.jsx';
import CrossChainDonate from '../components/CrossChainDonate.jsx';
import MilestoneVoting from '../components/MilestoneVoting.jsx';
import ErrorBoundary from '../components/ErrorBoundary';
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
  const { getCampaignDetails, withdrawFunds, cancelCampaign, claimRefund, isLoading, error } = useCampaign();
  const { selectedAccount } = useWallet();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isClaimingRefund, setIsClaimingRefund] = useState(false);
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

  const handleCancelCampaign = async () => {
    if (!campaign || !selectedAccount) return;

    if (!window.confirm('Are you sure you want to cancel this campaign? Donors will be able to claim refunds.')) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelCampaign(id);
      setShowToast({
        type: 'success',
        message: 'Campaign cancelled successfully. Donors can now claim refunds.'
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
      setIsCancelling(false);
    }
  };

  const handleClaimRefund = async () => {
    if (!campaign || !selectedAccount) return;

    setIsClaimingRefund(true);
    try {
      await claimRefund(id);
      setShowToast({
        type: 'success',
        message: 'Refund claimed successfully!'
      });
      // Refresh campaign details
      const details = await getCampaignDetails(id);
      setCampaign(details.campaign);
      setDonations(details.donations || []);
    } catch (err) {
      setShowToast({
        type: 'error',
        message: err.message
      });
    } finally {
      setIsClaimingRefund(false);
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

    // Helper function to compare addresses regardless of SS58 format
    const addressesMatch = (addr1, addr2) => {
      if (!addr1 || !addr2) return false;
      try {
        const pub1 = decodeAddress(addr1);
        const pub2 = decodeAddress(addr2);
        return u8aEq(pub1, pub2);
      } catch (err) {
        console.error('[CampaignDetailsPage] Failed to decode addresses:', err);
        return false;
      }
    };

    const isOwner = selectedAccount && addressesMatch(selectedAccount.address, campaign.owner);
    const userDonation = donations.find(d => addressesMatch(d.donor, selectedAccount?.address));

    return {
      progress,
      deadlineStatus,
      stateColor,
      formattedGoal: formatDOT(campaign.goal),
      formattedRaised: formatDOT(campaign.raised),
      isOwner,
      canWithdraw: selectedAccount && isOwner &&
        (campaign.state === 'Successful' || (campaign.state === 'Active' && deadlineStatus.daysLeft === 0)) &&
        campaign.state !== 'Withdrawn',
      canCancel: isOwner && campaign.state === 'Active',
      canClaimRefund: selectedAccount && campaign.state === 'Failed' && userDonation && userDonation.amount > 0
    };
  }, [campaign, selectedAccount, donations]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-text-primary mx-auto"></div>
          <p className="mt-4 text-text-muted font-sans">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-surface/50 border border-border rounded-2xl p-6">
            <div className="flex items-center">
              <p className="text-text-secondary font-sans">Error loading campaign: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign && !isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-surface/50 border border-border rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-serif text-text-primary mb-2">Campaign Not Found</h2>
            <p className="text-text-secondary font-sans mb-6">The campaign you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <a
              href="/campaigns"
              className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-sm hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity"
            >
              Browse All Campaigns
            </a>
          </div>
        </div>
      </div>
    );
  }

  const stateColorClasses = {
    green: 'bg-surface/50 text-text-primary border-border',
    blue: 'bg-surface/50 text-text-primary border-border',
    red: 'bg-surface/50 text-text-primary border-border',
    yellow: 'bg-surface/50 text-text-primary border-border',
    gray: 'bg-surface/50 text-text-primary border-border'
  };

  return (
    <div className="relative min-h-screen bg-background-dark text-text-primary">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-surface/50 rounded-full blur-[150px] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-surface/50 rounded-full blur-[150px] opacity-10"></div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`px-6 py-4 rounded-xl border backdrop-blur-xl ${showToast.type === 'success'
            ? 'bg-success/10 border-success/20 text-text-primary'
            : 'bg-error/10 border-error/20 text-text-primary'
            }`}>
            <p className="font-sans font-medium">{showToast.message}</p>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Campaign Details */}
          <div className="space-y-6">
            {/* Campaign Image */}
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src={campaign.imageUrl || 'https://via.placeholder.com/800x400?text=Campaign+Image'}
                alt={campaign.title}
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>

            {/* Campaign Header */}
            <div className="bg-surface/50 backdrop-blur-xl rounded-2xl border border-border p-6">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <h1 className="text-4xl font-bold font-serif text-text-primary">{campaign.title}</h1>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-xl border font-sans font-medium ${stateColorClasses[campaignStats?.stateColor] || stateColorClasses.gray}`}>
                    {campaign.state}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-all duration-300"
                      title="Share on Twitter"
                    >
                      <FiTwitter className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-all duration-300"
                      title="Share on Facebook"
                    >
                      <FiFacebook className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-all duration-300"
                      title="Share on LinkedIn"
                    >
                      <FiLinkedin className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-all duration-300"
                      title="Copy link"
                    >
                      <FiCopy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaign Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface/50 rounded-xl p-4 border border-border hover:bg-surface transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTrendingUp className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-text-muted">Funds Raised</span>
                  </div>
                  <p className="text-2xl font-serif text-text-primary">{campaignStats?.formattedRaised} DOT</p>
                  <p className="text-sm text-text-muted font-sans">of {campaignStats?.formattedGoal} DOT goal</p>
                </div>

                <div className="bg-surface/50 rounded-xl p-4 border border-border hover:bg-surface transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTarget className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-text-muted">Progress</span>
                  </div>
                  <p className="text-2xl font-serif text-text-primary">{campaignStats?.progress.toFixed(1)}%</p>
                  <div className="mt-2 w-full bg-border rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-primary h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(campaignStats?.progress || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-surface/50 rounded-xl p-4 border border-border hover:bg-surface transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-text-muted">Time Left</span>
                  </div>
                  <p className="text-2xl font-serif text-text-primary">
                    {campaignStats?.deadlineStatus.message}
                  </p>
                  <p className="text-sm text-text-muted font-sans">Deadline: {formatDate(campaign.deadline)}</p>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-wider text-text-muted mb-1">Created by</p>
                  <p className="text-text-primary font-mono text-sm">{shortenAddress(campaign.owner)}</p>
                </div>
                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-wider text-text-muted mb-1">Beneficiary</p>
                  <p className="text-text-primary font-mono text-sm">{shortenAddress(campaign.beneficiary)}</p>
                </div>
                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-wider text-text-muted mb-1">Total Donors</p>
                  <div className="flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-text-secondary" />
                    <p className="text-text-primary font-sans font-medium">{donations.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-surface/50 backdrop-blur-xl rounded-2xl border border-border p-6">
              {/* Tab Headers - Scrollable on mobile */}
              <div className="flex gap-2 border-b border-border pb-4 mb-6 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'about'
                    ? 'bg-white text-black'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                    }`}
                >
                  <FiHeart className="w-4 h-4" />
                  About
                </button>
                {campaign.uses_milestones && (
                  <button
                    onClick={() => setActiveTab('milestones')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'milestones'
                      ? 'bg-white text-black'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                      }`}
                  >
                    <FiTarget className="w-4 h-4" />
                    Milestones
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('updates')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'updates'
                    ? 'bg-white text-black'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                    }`}
                >
                  <FiTrendingUp className="w-4 h-4" />
                  Updates
                </button>
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'discussion'
                    ? 'bg-white text-black'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                    }`}
                >
                  <FiMessageSquare className="w-4 h-4" />
                  Discussion
                </button>
                <button
                  onClick={() => setActiveTab('donors')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'donors'
                    ? 'bg-white text-black'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                    }`}
                >
                  <FiUsers className="w-4 h-4" />
                  Donors ({donations.length})
                </button>
                <button
                  onClick={() => setActiveTab('crosschain')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'crosschain'
                    ? 'bg-white text-black'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                    }`}
                >
                  <span className="text-lg">🌉</span>
                  Cross-Chain
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'about' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">About this campaign</h2>
                  <p className="text-text-secondary font-sans leading-relaxed whitespace-pre-wrap">{campaign.description}</p>

                  {/* Show milestone creation for owners if campaign doesn't have milestones yet */}
                  {campaignStats?.isOwner && !campaign.uses_milestones && campaign.state === 'Active' && (
                    <div className="mt-6 p-4 bg-surface/50 border border-border rounded-xl">
                      <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                        <FiTarget className="w-5 h-5 text-text-primary" />
                        Enable Milestone-Based Funding?
                      </h3>
                      <p className="text-text-secondary text-sm mb-4">
                        Add milestones to your campaign for transparent, accountable fund releases.
                        Donors will vote on each milestone before funds are released.
                      </p>
                      <button
                        onClick={() => setActiveTab('milestones')}
                        className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
                      >
                        Add Milestones
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'milestones' && (
                <div className="animate-fade-in">
                  {campaign.uses_milestones ? (
                    <MilestoneVoting campaign={campaign} />
                  ) : (
                    <div className="text-center py-8">
                      <FiTarget className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <p className="text-text-secondary font-sans">
                        This campaign does not use milestones. Funds will be released once when the goal is reached.
                      </p>
                      {campaignStats?.isOwner && campaign.state === 'Active' && (
                        <p className="text-text-muted font-sans text-sm mt-4">
                          Milestone creation feature coming soon!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'updates' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Campaign Updates</h2>
                  <p className="text-text-secondary font-sans italic">
                    No updates yet. Campaign updates will appear here as the creator shares progress.
                  </p>
                </div>
              )}

              {activeTab === 'discussion' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Discussion</h2>
                  <p className="text-text-secondary font-sans italic">
                    Comments and discussion feature coming soon. Stay tuned!
                  </p>
                </div>
              )}

              {activeTab === 'donors' && (
                <div className="animate-fade-in space-y-4">
                  <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Recent Donations</h2>
                  {donations.length > 0 ? (
                    donations.slice(0, 10).map((donation, index) => (
                      <div key={index} className="bg-surface/50 rounded-xl p-4 border border-border hover:bg-surface transition-all duration-300">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-background-dark border border-border flex items-center justify-center text-text-primary font-serif">
                              {shortenAddress(donation.donor)[0]}
                            </div>
                            <div>
                              <p className="text-text-primary font-sans font-medium font-mono">{shortenAddress(donation.donor)}</p>
                              <p className="text-sm text-text-muted font-sans">
                                {formatDateTime(donation.timestamp)}
                              </p>
                            </div>
                          </div>
                          <span className="px-4 py-2 bg-surface/50 text-text-primary rounded-xl font-mono text-sm border border-border">
                            {formatDOT(donation.amount)} DOT
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FiHeart className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <p className="text-text-secondary font-sans italic">
                        No donations yet. Be the first to support this campaign!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'crosschain' && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl">🌉</span>
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-text-primary">Cross-Chain Donations</h2>
                      <p className="text-text-secondary font-sans">Powered by Polkadot XCM</p>
                    </div>
                  </div>

                  <div className="bg-surface/50 border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                      <span>⚡</span>
                      What is Cross-Chain Donation?
                    </h3>
                    <p className="text-text-secondary font-sans leading-relaxed mb-4">
                      With Polkadot&apos;s XCM (Cross-Consensus Messaging), you can donate to this campaign
                      from <span className="font-bold text-text-primary">ANY</span> connected parachain!
                      No need to bridge assets manually - XCM handles everything automatically.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-background-dark rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">💰</span>
                          <h4 className="font-bold text-text-primary">Supported Chains</h4>
                        </div>
                        <ul className="text-sm text-text-secondary space-y-1">
                          <li>• Polkadot Relay Chain</li>
                          <li>• Moonbeam (GLMR, USDC)</li>
                          <li>• Acala (ACA, aUSD)</li>
                          <li>• Asset Hub (USDT, USDC)</li>
                          <li>• Astar (ASTR)</li>
                        </ul>
                      </div>

                      <div className="bg-background-dark rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">⚙️</span>
                          <h4 className="font-bold text-text-primary">How It Works</h4>
                        </div>
                        <ol className="text-sm text-text-secondary space-y-1">
                          <li>1. Select your source chain</li>
                          <li>2. Choose asset (DOT, USDC, etc.)</li>
                          <li>3. Enter amount</li>
                          <li>4. Sign XCM transfer</li>
                          <li>5. Assets delivered in 12-24s</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface/50 border border-border rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <h4 className="font-bold text-text-primary mb-1">Why Cross-Chain?</h4>
                        <ul className="text-sm text-text-secondary space-y-1">
                          <li>• <strong>Convenience:</strong> Use assets from any chain</li>
                          <li>• <strong>Security:</strong> Native Polkadot protocol (no bridges!)</li>
                          <li>• <strong>Speed:</strong> Transfers complete in seconds</li>
                          <li>• <strong>Cost-Effective:</strong> Low XCM fees (~$0.01-0.10)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface/50 border border-border rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h4 className="font-bold text-text-primary mb-1">Pro Tip</h4>
                        <p className="text-sm text-text-secondary">
                          Cross-chain donations work seamlessly with our <strong>Quadratic Funding</strong> system!
                          Your donation will receive matching multipliers just like regular donations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-text-secondary text-sm font-sans">
                      👉 Use the <strong className="text-text-primary">Cross-Chain Donation</strong> section
                      below to get started!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Withdraw Button for Campaign Owner */}
            {campaignStats?.canWithdraw && (
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="w-full py-4 bg-white text-black rounded-sm font-semibold text-lg hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            {/* Cancel Campaign Button for Campaign Owner */}
            {campaignStats?.canCancel && (
              <button
                onClick={handleCancelCampaign}
                disabled={isCancelling}
                className="w-full py-4 bg-error/10 text-error border border-error/30 rounded-xl font-sans font-bold text-lg hover:bg-error/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-error"></div>
                    Cancelling campaign...
                  </>
                ) : (
                  <>
                    <FiXCircle className="w-5 h-5" />
                    Cancel Campaign
                  </>
                )}
              </button>
            )}

            {/* Claim Refund Button for Donors */}
            {campaignStats?.canClaimRefund && (
              <button
                onClick={handleClaimRefund}
                disabled={isClaimingRefund}
                className="w-full py-4 bg-white text-black rounded-sm font-semibold text-lg hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isClaimingRefund ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Claiming refund...
                  </>
                ) : (
                  <>
                    <FiDollarSign className="w-5 h-5" />
                    Claim Refund
                  </>
                )}
              </button>
            )}
          </div>

          {/* Donation Interfaces Section */}
          <div className={`grid gap-8 ${campaign.state === 'Active' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
            {/* Regular Donation Interface */}
            <ErrorBoundary>
              <DonationInterface
                campaignId={id}
                campaign={campaign}
                onDonationSuccess={async () => {
                  // Refresh campaign details after successful donation
                  const details = await getCampaignDetails(id);
                  if (details) {
                    setCampaign(details.campaign);
                    setDonations(details.donations || []);
                  }
                }}
              />
            </ErrorBoundary>

            {/* Cross-Chain Donation Interface */}
            {campaign.state === 'Active' && (
              <ErrorBoundary>
                <CrossChainDonate
                  campaignId={id}
                  contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS}
                  onSuccess={async (xcmData) => {
                    // Show success toast
                    setShowToast({
                      type: 'success',
                      message: `Cross-chain donation of ${xcmData.amount} ${xcmData.asset} from ${xcmData.chain} successful!`
                    });

                    // Refresh campaign details after XCM delivery
                    setTimeout(async () => {
                      const details = await getCampaignDetails(id);
                      if (details) {
                        setCampaign(details.campaign);
                        setDonations(details.donations || []);
                      }
                    }, 15000); // Wait 15s for XCM delivery + contract update
                  }}
                />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsPage;
