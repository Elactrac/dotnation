import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';

const NewDashboardPage = () => {
  const { campaigns, isLoading, refreshCampaigns } = useCampaign();
  const { selectedAccount } = useWallet();
  const [totalRaised, setTotalRaised] = useState(0);
  const [myContributions, setMyContributions] = useState([]);

  const fetchCampaigns = useCallback(() => {
    refreshCampaigns();
  }, [refreshCampaigns]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    // Calculate total raised across all campaigns
    if (campaigns.length > 0) {
      const total = campaigns.reduce((sum, campaign) => sum + parseFloat(campaign.raised || 0), 0);
      setTotalRaised(total);
    }

    // Filter user's contributions (mock data for now - should come from blockchain)
    if (selectedAccount) {
      const mockContributions = [
        { name: 'DeFi For Good', amount: 500, date: '2 days ago' },
        { name: 'Ocean Cleanup DAO', amount: 250, date: '1 week ago' },
        { name: 'Open Source Education', amount: 100, date: '3 weeks ago' },
      ];
      setMyContributions(mockContributions);
    }
  }, [campaigns, selectedAccount]);

  const formatDOT = (amount) => {
    return parseFloat(amount).toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const calculateProgress = (raised, goal) => {
    const raisedNum = parseFloat(raised);
    const goalNum = parseFloat(goal);
    return goalNum > 0 ? Math.min((raisedNum / goalNum) * 100, 100) : 0;
  };

  const trendingCampaigns = campaigns.slice(0, 3);
  const activeCampaigns = campaigns.filter((c) => c.status === 'Active');

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-white">Dashboard</h1>
        <p className="mt-2 text-lg text-white/60 font-body">Overview of the DotNation ecosystem.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
          <p className="text-sm font-medium text-white/60">Total Raised</p>
          <p className="text-3xl font-bold font-display text-white mt-2">{formatDOT(totalRaised)} DOT</p>
          <p className="text-sm text-green-400 font-medium mt-1">+15.2% last 30 days</p>
        </div>

        <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
          <p className="text-sm font-medium text-white/60">Active Projects</p>
          <p className="text-3xl font-bold font-display text-white mt-2">{activeCampaigns.length}</p>
          <p className="text-sm text-white/50 font-medium mt-1">3 new projects this week</p>
        </div>

        <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
          <p className="text-sm font-medium text-white/60">Unique Contributors</p>
          <p className="text-3xl font-bold font-display text-white mt-2">3,456</p>
          <p className="text-sm text-white/50 font-medium mt-1">Growing daily</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trending Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display text-white">Trending Projects</h2>
            <Link to="/campaigns" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>

           {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-white/60 mt-4">Loading campaigns...</p>
            </div>
          ) : trendingCampaigns.length > 0 ? (
            <div className="space-y-4">
              {trendingCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  to={`/campaign/${campaign.id}`}
                  className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="font-bold font-display text-lg text-white">{campaign.title}</h3>
                    <p className="text-sm text-white/60">By {campaign.beneficiary?.slice(0, 8)}...</p>
                  </div>

                  <div className="text-right">
                     <p className="font-bold font-display text-lg text-white">{formatDOT(campaign.raised)} DOT</p>
                     <p className="text-sm text-white/60">{Math.round(calculateProgress(campaign.raised, campaign.goal))}% funded</p>
                  </div>

                  <div className="pl-4">
                    <button className="flex items-center justify-center rounded-full h-10 px-6 bg-primary/20 text-white text-sm font-bold tracking-wide hover:bg-primary/30 transition-colors duration-300">
                      Fund
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg">
              <p className="text-white/60">No campaigns available yet.</p>
              <Link
                to="/create-campaign"
                className="inline-block mt-4 text-primary hover:underline font-medium"
              >
                Create the first campaign
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Your Contributions */}
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg">
            <h3 className="text-2xl font-bold font-display mb-6 text-white">Your Contributions</h3>

            {selectedAccount ? (
              <>
                <div className="space-y-4">
                  {myContributions.map((contribution, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-white font-medium">{contribution.name}</p>
                        <p className="text-primary font-bold">{contribution.amount} DOT</p>
                      </div>
                      <p className="text-xs text-white/50">{contribution.date}</p>
                      {index < myContributions.length - 1 && <div className="w-full h-px bg-white/10 mt-4" />}
                    </div>
                  ))}
                </div>

                <button className="mt-6 w-full flex items-center justify-center rounded-full h-10 bg-white/10 text-white text-sm font-bold tracking-wide hover:bg-white/20 transition-colors duration-300">
                  View History
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60 mb-4">Connect your wallet to see your contributions</p>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg">
            <h3 className="text-2xl font-bold font-display mb-6 text-white">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['Technology', 'Art', 'Environment', 'Social Good', 'DeFi', 'Gaming'].map((category) => (
                <button
                  key={category}
                  className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
                    category === 'Technology'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDashboardPage;
