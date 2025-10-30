import { useState, useEffect, useMemo } from 'react';
import {
  FiHeart,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiExternalLink,
  FiAward,
  FiTarget,
  FiActivity
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext';
import { formatDOT, formatDateTime, shortenAddress } from '../utils/formatters';
import PageErrorBoundary from '../components/PageErrorBoundary';

const MyDonationsPage = () => {
  const { campaigns, isLoading, error } = useCampaign();
  const { selectedAccount } = useWallet();
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  // Fetch donations from all campaigns
  useEffect(() => {
    const fetchAllDonations = async () => {
      if (!selectedAccount || !campaigns.length) return;

      setLoadingDonations(true);
      try {
        const allDonations = [];

        // Get detailed campaign data to access donations
        for (const campaign of campaigns) {
          try {
            // This would need to be implemented in the context to get donation history
            // For now, we'll simulate with mock data
            const mockDonations = [
              {
                campaignId: campaign.id,
                campaignTitle: campaign.title,
                amount: 1000000000000n, // 1 DOT in plancks
                timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random time in last 30 days
                txHash: '0x' + Math.random().toString(16).substr(2, 64)
              }
            ].filter(() => Math.random() > 0.7); // 30% chance of having donated

            allDonations.push(...mockDonations);
          } catch (err) {
            console.warn(`Failed to get donations for campaign ${campaign.id}:`, err);
          }
        }

        // Sort by timestamp (newest first)
        allDonations.sort((a, b) => b.timestamp - a.timestamp);
        setDonations(allDonations);
      } catch (err) {
        console.error('Failed to fetch donations:', err);
      } finally {
        setLoadingDonations(false);
      }
    };

    fetchAllDonations();
  }, [selectedAccount, campaigns]);

  // Calculate donation statistics
  const donationStats = useMemo(() => {
    const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0n);
    const totalDonations = donations.length;
    const uniqueCampaigns = new Set(donations.map(d => d.campaignId)).size;
    const avgDonation = totalDonations > 0 ? totalAmount / BigInt(totalDonations) : 0n;

    return {
      totalAmount,
      totalDonations,
      uniqueCampaigns,
      avgDonation
    };
  }, [donations]);

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
                <p className="text-yellow-400/80 font-body">Please connect your wallet to view your donation history.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || loadingDonations) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-white/70 font-body">Loading your donation history...</p>
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

  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-5xl font-bold font-display bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-2">
              My Donations
            </h1>
            <p className="text-lg text-white/70 font-body">
              Track your impact and donation history across all campaigns
            </p>
          </div>

          {/* Stats Overview */}
          {donations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <FiDollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-sm font-body font-semibold uppercase text-white/70">Total Donated</span>
                </div>
                <p className="text-3xl font-bold font-display text-green-400 mb-1">
                  {formatDOT(donationStats.totalAmount)} DOT
                </p>
                <p className="text-sm text-white/60 font-body">
                  across {donationStats.totalDonations} donations
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <FiTarget className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-sm font-body font-semibold uppercase text-white/70">Campaigns Supported</span>
                </div>
                <p className="text-3xl font-bold font-display text-blue-400 mb-1">
                  {donationStats.uniqueCampaigns}
                </p>
                <p className="text-sm text-white/60 font-body">unique campaigns</p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <FiActivity className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-sm font-body font-semibold uppercase text-white/70">Average Donation</span>
                </div>
                <p className="text-3xl font-bold font-display text-purple-400 mb-1">
                  {formatDOT(donationStats.avgDonation)} DOT
                </p>
                <p className="text-sm text-white/60 font-body">per campaign</p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <FiAward className="w-6 h-6 text-orange-400" />
                  </div>
                  <span className="text-sm font-body font-semibold uppercase text-white/70">Impact Score</span>
                </div>
                <p className="text-3xl font-bold font-display text-orange-400 mb-1">
                  {Math.floor(Number(donationStats.totalAmount) / 1000000000000)} ⭐
                </p>
                <p className="text-sm text-white/60 font-body">based on total donated</p>
              </div>
            </div>
          )}

          {/* Donations List */}
          {donations.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-12 text-center animate-fade-in">
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                  <FiHeart className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-3xl font-bold font-display text-white">No Donations Yet</h3>
                <p className="text-white/70 font-body max-w-md mx-auto">
                  You haven&apos;t made any donations yet. Browse campaigns and start supporting causes you care about!
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-body font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20"
                >
                  <FiTrendingUp className="w-5 h-5" />
                  Browse Campaigns
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {donations.map((donation, index) => (
                <div
                  key={`${donation.campaignId}-${index}`}
                  className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex-1 min-w-[250px] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <FiHeart className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold font-display text-white line-clamp-1">
                          {donation.campaignTitle}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-500/20 rounded">
                            <FiDollarSign className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="text-sm font-body text-white/80">
                            {formatDOT(donation.amount)} DOT
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-500/20 rounded">
                            <FiCalendar className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-sm font-body text-white/80">
                            {formatDateTime(donation.timestamp)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-white/60 font-body font-mono bg-gray-900/50 px-3 py-1.5 rounded-lg inline-block">
                        TX: {shortenAddress(donation.txHash)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-body font-bold border-2 border-green-500/30">
                        Completed
                      </span>
                      <Link
                        to={`/dashboard/campaign/${donation.campaignId}`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/40 rounded-xl text-primary font-body font-semibold hover:border-primary hover:from-primary/30 hover:to-secondary/30 transition-all duration-300"
                      >
                        <FiExternalLink className="w-4 h-4" />
                        View Campaign
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {donations.length > 0 && (
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-xl rounded-2xl border-2 border-primary/30 p-8 text-center animate-fade-in">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <FiTrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold font-display text-white">Keep Making a Difference</h3>
                <p className="text-white/80 font-body max-w-2xl mx-auto">
                  Your donations have helped <span className="text-primary font-bold">{donationStats.uniqueCampaigns}</span> campaigns.
                  Discover more causes to support!
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-body font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20"
                >
                  Browse More Campaigns
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyDonationsPageWrapper = () => (
  <PageErrorBoundary pageName="My Donations">
    <MyDonationsPage />
  </PageErrorBoundary>
);

MyDonationsPageWrapper.displayName = 'MyDonationsPageWrapper';

export default MyDonationsPageWrapper;
