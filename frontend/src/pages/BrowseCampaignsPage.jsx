import { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiX, FiSliders } from 'react-icons/fi';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { formatDOT } from '../utils/formatters';
import PageErrorBoundary from '../components/PageErrorBoundary';
import { useWallet } from '../contexts/WalletContext.jsx';
import CampaignCard from '../components/CampaignCard';
import { CampaignCardSkeleton } from '../components/SkeletonLoader';

// Helper function to calculate campaign progress
const calculateProgress = (raised, goal) => {
  if (!goal || goal === 0) return 0;
  return Math.min((Number(raised) / Number(goal)) * 100, 100);
};

const BrowseCampaignsPage = () => {
  const { campaigns, isLoading, error } = useCampaign();
  const { selectedAccount } = useWallet();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [goalRange, setGoalRange] = useState([0, 100000]); // DOT range
  const [progressRange, setProgressRange] = useState([0, 100]); // Progress percentage
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Mock categories (in a real app, these would come from the backend)
  const availableCategories = [
    'Technology', 'Education', 'Health', 'Environment',
    'Arts', 'Community', 'Business', 'Charity'
  ];

  // Effect to clear user-specific filters on wallet disconnect
  useEffect(() => {
    if (!selectedAccount) {
      // Here you could clear filters that are user-specific in the future
    }
  }, [selectedAccount]);

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];

    let filtered = campaigns.filter(campaign => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = campaign.title.toLowerCase().includes(query);
        const matchesDescription = campaign.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && campaign.state.toLowerCase() !== statusFilter) {
        return false;
      }

      // Goal range filter (convert to plancks for comparison)
      const goalInDOT = Number(campaign.goal) / 1_000_000_000_000;
      if (goalInDOT < goalRange[0] || goalInDOT > goalRange[1]) {
        return false;
      }

      // Progress range filter
      const progress = calculateProgress(campaign.raised, campaign.goal);
      if (progress < progressRange[0] || progress > progressRange[1]) {
        return false;
      }

      // Category filter (mock implementation)
      if (selectedCategories.length > 0) {
        // In a real app, campaigns would have categories
        // For now, we'll randomly assign categories for demo
        const campaignCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        if (!selectedCategories.includes(campaignCategory)) {
          return false;
        }
      }

      return true;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.deadline - a.deadline; // Newer deadlines first
        case 'oldest':
          return a.deadline - b.deadline;
        case 'goal-high':
          return Number(b.goal - a.goal);
        case 'goal-low':
          return Number(a.goal - b.goal);
        case 'progress-high':
          return calculateProgress(b.raised, b.goal) - calculateProgress(a.raised, a.goal);
        case 'progress-low':
          return calculateProgress(a.raised, a.goal) - calculateProgress(b.raised, b.goal);
        case 'raised-high':
          return Number(b.raised - a.raised);
        case 'raised-low':
          return Number(a.raised - b.raised);
        default:
          return 0;
      }
    });

    return filtered;
  }, [campaigns, searchQuery, statusFilter, sortBy, goalRange, progressRange, selectedCategories]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('newest');
    setGoalRange([0, 100000]);
    setProgressRange([0, 100]);
    setSelectedCategories([]);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== 'all') count++;
    if (sortBy !== 'newest') count++;
    if (goalRange[0] !== 0 || goalRange[1] !== 100000) count++;
    if (progressRange[0] !== 0 || progressRange[1] !== 100) count++;
    if (selectedCategories.length > 0) count++;
    return count;
  }, [searchQuery, statusFilter, sortBy, goalRange, progressRange, selectedCategories]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-white/70">Loading campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-400">Error loading campaigns: {error}</p>
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
          <div className="text-left animate-fade-in">
            <h1 className="text-5xl font-bold font-display bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-3">
              Browse Campaigns
            </h1>
            <p className="text-lg text-white/70 font-body">Discover and support amazing causes from around the world</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 transition-all duration-300">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="text"
                  placeholder="Search campaigns by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-white/40 font-body focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-600 transition-all duration-300"
                />
              </div>

              {/* Filter Toggle and Sort */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-body transition-all duration-300 ${
                      activeFiltersCount > 0
                        ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/50 text-primary hover:border-primary'
                        : 'bg-gray-900/50 border-gray-700 text-white/70 hover:bg-gray-800/50 hover:border-gray-600'
                    } md:hidden`}
                  >
                    <FiSliders className="w-4 h-4" />
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </button>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm bg-white/10 text-white rounded-xl hover:bg-white/20 font-body transition-all duration-300"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/60 whitespace-nowrap font-body font-semibold uppercase">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white text-sm font-body focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-600 transition-all duration-300"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="goal-high">Highest Goal</option>
                    <option value="goal-low">Lowest Goal</option>
                    <option value="progress-high">Most Funded</option>
                    <option value="progress-low">Least Funded</option>
                    <option value="raised-high">Most Raised</option>
                    <option value="raised-low">Least Raised</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center flex-wrap gap-4 animate-fade-in">
            <p className="text-white/70 font-body">
              Showing <span className="text-white font-bold">{filteredCampaigns.length}</span> of <span className="text-white font-bold">{campaigns?.length || 0}</span> campaigns
            </p>
            {activeFiltersCount > 0 && (
              <span className="px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/40 text-primary text-sm rounded-full font-body font-semibold">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
              </span>
            )}
          </div>

          {/* Campaigns Grid */}
          {filteredCampaigns.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-12 text-center hover:border-primary/30 transition-all duration-300">
              <div className="space-y-4">
                <FiSearch className="w-16 h-16 text-white/40 mx-auto" />
                <h3 className="text-2xl font-bold font-display text-white/70">No Campaigns Found</h3>
                <p className="text-white/60 font-body max-w-md mx-auto">
                  {activeFiltersCount > 0
                    ? "Try adjusting your filters or search terms to find more campaigns."
                    : "There are no campaigns available at the moment. Check back later!"
                  }
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:scale-105 font-body font-semibold transition-all duration-300 shadow-lg shadow-primary/20"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <CampaignCardSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  showStats={true}
                />
              ))}
            </div>
          )}

          {/* Mobile Filters Panel */}
          {isFiltersOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsFiltersOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-background-dark border-l-2 border-gray-700 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold font-display text-white">Filters</h3>
                  <button
                    onClick={() => setIsFiltersOpen(false)}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold font-body uppercase text-white/70 mb-3">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white font-body focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-600 transition-all duration-300"
                    >
                      <option value="all">All Campaigns</option>
                      <option value="Active">Active</option>
                      <option value="Successful">Successful</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-semibold font-body uppercase text-white/70 mb-3">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white font-body focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-600 transition-all duration-300"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="most-funded">Most Funded</option>
                      <option value="least-funded">Least Funded</option>
                      <option value="ending-soon">Ending Soon</option>
                    </select>
                  </div>

                  {/* Goal Range */}
                  <div>
                    <label className="block text-sm font-semibold font-body uppercase text-white/70 mb-3">
                      Goal Range: {formatDOT(goalRange[0])} - {formatDOT(goalRange[1])} DOT
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={goalRange[0]}
                      onChange={(e) => setGoalRange([Number(e.target.value), goalRange[1]])}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={goalRange[1]}
                      onChange={(e) => setGoalRange([goalRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    />
                  </div>

                  {/* Progress Range */}
                  <div>
                    <label className="block text-sm font-semibold font-body uppercase text-white/70 mb-3">
                      Progress: {progressRange[0]}% - {progressRange[1]}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressRange[0]}
                      onChange={(e) => setProgressRange([Number(e.target.value), progressRange[1]])}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressRange[1]}
                      onChange={(e) => setProgressRange([progressRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-semibold font-body uppercase text-white/70 mb-3">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryToggle(category)}
                          className={`px-4 py-2 text-sm font-body rounded-full transition-all duration-300 ${
                            selectedCategories.includes(category)
                              ? 'bg-gradient-to-r from-primary to-secondary text-white border-2 border-primary'
                              : 'bg-gray-900/50 border-2 border-gray-700 text-white/70 hover:bg-gray-800/50 hover:border-gray-600'
                          }`}
                        >
                          {category}
                          {selectedCategories.includes(category) && (
                            <FiX className="inline w-3 h-3 ml-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:scale-105 font-body font-semibold transition-all duration-300 shadow-lg shadow-primary/20"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BrowseCampaignsPageWrapper = () => (
  <PageErrorBoundary pageName="Browse Campaigns">
    <BrowseCampaignsPage />
  </PageErrorBoundary>
);

BrowseCampaignsPageWrapper.displayName = 'BrowseCampaignsPageWrapper';

export default BrowseCampaignsPageWrapper;
