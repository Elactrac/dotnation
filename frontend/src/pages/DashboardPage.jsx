import { Link } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext';
import { formatDOT } from '../utils/formatters';

const DashboardPage = () => {
  const { campaigns } = useCampaign();
  const { selectedAccount } = useWallet();

  // Calculate platform stats
  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.raised || 0n), 0n) || 0n;
  const activeCampaigns = campaigns?.filter(c => c.state === 'Active').length || 0;
  const uniqueContributors = 3456; // Mock data

  // Mock trending projects
  const trendingProjects = campaigns?.slice(0, 3).map(campaign => ({
    id: campaign.id,
    title: campaign.title,
    creator: 'Community Builder',
    raised: campaign.raised,
    goal: campaign.goal,
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200',
  })) || [];

  // Mock user contributions
  const userContributions = [
    { project: 'DeFi For Good', amount: '500 DOT', date: '2 days ago' },
    { project: 'Ocean Cleanup DAO', amount: '250 DOT', date: '1 week ago' },
    { project: 'Open Source Education', amount: '100 DOT', date: '3 weeks ago' },
  ];

  const categories = ['Technology', 'Art', 'Environment', 'Social Good', 'DeFi', 'Gaming'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
          Dashboard
        </h1>
        <p className="text-lg md:text-xl text-gray-300 font-body">
          Overview of the DotNation ecosystem
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up">
        {/* Total Raised */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-8 hover:border-primary/50 transition-all duration-300 group">
          <p className="text-sm font-bold font-display text-gray-400 uppercase tracking-wider mb-3">
            Total Raised
          </p>
          <h2 className="text-4xl font-bold font-display text-gray-100 mb-2 group-hover:text-primary transition-colors">
            {formatDOT(totalRaised)} DOT
          </h2>
          <p className="text-sm text-green-400 font-body font-medium flex items-center gap-1">
            <span>↗</span>
            <span>+15.2% last 30 days</span>
          </p>
        </div>

        {/* Active Projects */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-8 hover:border-secondary/50 transition-all duration-300 group">
          <p className="text-sm font-bold font-display text-gray-400 uppercase tracking-wider mb-3">
            Active Projects
          </p>
          <h2 className="text-4xl font-bold font-display text-gray-100 mb-2 group-hover:text-secondary transition-colors">
            {activeCampaigns}
          </h2>
          <p className="text-sm text-gray-400 font-body font-medium">
            {campaigns?.length || 0} total campaigns
          </p>
        </div>

        {/* Unique Contributors */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-8 hover:border-primary/50 transition-all duration-300 group">
          <p className="text-sm font-bold font-display text-gray-400 uppercase tracking-wider mb-3">
            Unique Contributors
          </p>
          <h2 className="text-4xl font-bold font-display text-gray-100 mb-2 group-hover:text-primary transition-colors">
            {uniqueContributors.toLocaleString()}
          </h2>
          <p className="text-sm text-gray-400 font-body font-medium">
            Growing daily
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Trending Projects */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-display text-gray-100">
              Trending Projects
            </h2>
            <Link
              to="/dashboard/browse"
              className="text-primary hover:text-secondary font-body font-medium transition-colors text-sm flex items-center gap-1"
            >
              View All
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-4">
            {trendingProjects.length > 0 ? (
              trendingProjects.map((project, index) => {
                const percentFunded = project.goal > 0n 
                  ? Number((project.raised * 100n) / project.goal)
                  : 0;

                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group"
                  >
                    <div className="flex gap-4 items-center flex-wrap md:flex-nowrap">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-600"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold font-display text-gray-100 mb-1 truncate">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-400 font-body">
                          By {project.creator}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <p className="text-2xl font-bold font-display text-gray-100">
                          {formatDOT(project.raised)} DOT
                        </p>
                        <p className="text-sm text-gray-400 font-body">
                          {percentFunded}% funded
                        </p>
                      </div>

                      <Link
                        to={`/dashboard/campaign/${project.id}`}
                        className="px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-primary border border-primary/30 rounded-xl transition-all duration-200 font-body font-bold"
                      >
                        Fund
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-12 text-center">
                <p className="text-gray-400 font-body mb-6">
                  No campaigns available yet. Be the first to create one!
                </p>
                <Link
                  to="/dashboard/create-campaign"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-body font-bold rounded-xl hover:shadow-glow transition-all duration-200 hover:scale-105"
                >
                  Create Campaign
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          {/* Your Contributions */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6">
            <h2 className="text-xl font-bold font-display text-gray-100 mb-6">
              Your Contributions
            </h2>

            {selectedAccount ? (
              <div className="space-y-4">
                {userContributions.map((contrib, index) => (
                  <div key={index}>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-100 font-body font-medium">
                          {contrib.project}
                        </p>
                        <p className="text-primary font-body font-bold">
                          {contrib.amount}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 font-body">
                        {contrib.date}
                      </p>
                    </div>
                    {index < userContributions.length - 1 && (
                      <div className="h-px bg-gray-700 mt-4"></div>
                    )}
                  </div>
                ))}

                <Link
                  to="/dashboard/my-donations"
                  className="block w-full mt-6 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-100 font-body font-medium rounded-xl transition-all duration-200 text-center border border-gray-700"
                >
                  View History
                </Link>
              </div>
            ) : (
              <p className="text-gray-400 font-body text-center py-8">
                Connect your wallet to see your contributions
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6">
            <h2 className="text-xl font-bold font-display text-gray-100 mb-6">
              Categories
            </h2>

            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full font-body font-medium text-sm transition-all duration-200 ${
                    index === 0
                      ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/30'
                      : 'bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-gray-600'
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

export default DashboardPage;
