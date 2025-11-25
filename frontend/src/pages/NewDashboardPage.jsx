import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';
import { FiArrowRight, FiTrendingUp, FiActivity, FiUsers } from 'react-icons/fi';

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
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">Dashboard</h1>
        <p className="text-lg text-white/60 font-sans">Overview of the DotNation ecosystem.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-white/60 uppercase tracking-wider">Total Raised</p>
            <FiTrendingUp className="text-white/40 group-hover:text-white transition-colors" />
          </div>
          <p className="text-3xl font-serif text-white mb-2">{formatDOT(totalRaised)} DOT</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-400 font-medium">+15.2%</span>
            <span className="text-white/40">last 30 days</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-white/60 uppercase tracking-wider">Active Projects</p>
            <FiActivity className="text-white/40 group-hover:text-white transition-colors" />
          </div>
          <p className="text-3xl font-serif text-white mb-2">{activeCampaigns.length}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white font-medium">3 new</span>
            <span className="text-white/40">this week</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-white/60 uppercase tracking-wider">Contributors</p>
            <FiUsers className="text-white/40 group-hover:text-white transition-colors" />
          </div>
          <p className="text-3xl font-serif text-white mb-2">3,456</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white font-medium">Growing</span>
            <span className="text-white/40">daily</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trending Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-white">Trending Projects</h2>
            <Link to="/campaigns" className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
              View All <FiArrowRight />
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="text-white/60 mt-4 text-sm">Loading campaigns...</p>
            </div>
          ) : trendingCampaigns.length > 0 ? (
            <div className="space-y-4">
              {trendingCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  to={`/campaign/${campaign.id}`}
                  className="group grid grid-cols-[auto,1fr,auto] md:grid-cols-[auto,1fr,auto,auto] items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="w-14 h-14 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                    <span className="font-serif text-xl text-white/80">{campaign.title.charAt(0)}</span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-serif text-lg text-white truncate group-hover:text-white transition-colors">{campaign.title}</h3>
                    <p className="text-sm text-white/50 truncate">By {campaign.beneficiary?.slice(0, 8)}...</p>
                  </div>

                  <div className="text-right hidden md:block">
                    <p className="font-medium text-white">{formatDOT(campaign.raised)} DOT</p>
                    <p className="text-xs text-white/50">{Math.round(calculateProgress(campaign.raised, campaign.goal))}% funded</p>
                  </div>

                  <div className="pl-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <FiArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <p className="text-white/60 mb-4">No campaigns available yet.</p>
              <Link
                to="/create-campaign"
                className="inline-flex items-center gap-2 px-6 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Start a Campaign
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Your Contributions */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <h3 className="text-xl font-serif mb-6 text-white">Your Contributions</h3>

            {selectedAccount ? (
              <>
                <div className="space-y-4">
                  {myContributions.map((contribution, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-white font-medium text-sm group-hover:text-white transition-colors">{contribution.name}</p>
                        <p className="text-white/80 font-mono text-sm">{contribution.amount} DOT</p>
                      </div>
                      <p className="text-xs text-white/40">{contribution.date}</p>
                      {index < myContributions.length - 1 && <div className="w-full h-px bg-white/5 mt-3" />}
                    </div>
                  ))}
                </div>

                <button className="mt-6 w-full py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                  View History
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/50 text-sm mb-4">Connect your wallet to see your contributions</p>
                <button onClick={() => { }} className="text-white hover:underline text-sm">Connect Wallet</button>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <h3 className="text-xl font-serif mb-6 text-white">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['Technology', 'Art', 'Environment', 'Social Good', 'DeFi', 'Gaming'].map((category) => (
                <button
                  key={category}
                  className="px-3 py-1.5 text-xs rounded-full font-medium transition-colors bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20"
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
