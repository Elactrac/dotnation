import { useState, useMemo } from 'react';
import { FiSearch, FiX, FiSliders } from 'react-icons/fi';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { formatDOT } from '../utils/formatters';
import PageErrorBoundary from '../components/PageErrorBoundary';
import CampaignCard from '../components/CampaignCard';
import { CampaignCardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

// Helper function to calculate campaign progress
const calculateProgress = (raised, goal) => {
  if (!goal || goal === 0) return 0;
  return Math.min((Number(raised) / Number(goal)) * 100, 100);
};

const BrowseCampaignsPage = () => {
  const { campaigns, isLoading, error } = useCampaign();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [goalRange, setGoalRange] = useState([0, 100000]); // DOT range
  const [progressRange, setProgressRange] = useState([0, 100]); // Progress percentage
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Mock categories (in a real app, these would come from the backend)
  const availableCategories = useMemo(() => [
    'Technology', 'Education', 'Health', 'Environment',
    'Arts', 'Community', 'Business', 'Charity'
  ], []);

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
  }, [campaigns, searchQuery, statusFilter, sortBy, goalRange, progressRange, selectedCategories, availableCategories]);

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-primary mx-auto"></div>
            <p className="mt-4 text-text-muted text-sm">Loading campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-error/10 border border-error/20 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center">
                <FiX className="w-4 h-4 text-error" />
              </div>
              <p className="text-error text-sm">Error loading campaigns: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background-dark text-text-primary">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-surface/50 rounded-full blur-[150px] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-surface/50 rounded-full blur-[150px] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-3">
              Browse Campaigns
            </h1>
            <p className="text-lg text-text-secondary font-sans max-w-2xl">Discover and support amazing causes from around the world.</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-surface/50 backdrop-blur-xl rounded-2xl border border-border p-6">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background-dark border border-border rounded-xl text-text-primary placeholder-text-muted font-sans focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Filter Toggle and Sort */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium transition-all relative ${activeFiltersCount > 0
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-surface/50 border-border text-text-secondary hover:border-primary/30'
                      }`}
                  >
                    <FiSliders className="w-4 h-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary whitespace-nowrap font-medium uppercase tracking-wider">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-background-dark border border-border rounded-xl text-text-primary text-sm font-sans focus:ring-1 focus:ring-primary/50 focus:border-primary/50 cursor-pointer hover:bg-surface/50 transition-colors"
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
          <div className="flex justify-between items-center flex-wrap gap-4">
            <p className="text-text-secondary text-sm">
              Showing <span className="text-text-primary font-medium">{filteredCampaigns.length}</span> of <span className="text-text-primary font-medium">{campaigns?.length || 0}</span> campaigns
            </p>
          </div>

          {/* Campaigns Grid */}
          {filteredCampaigns.length === 0 ? (
            <EmptyState
              icon={FiSearch}
              title="No Campaigns Found"
              description={
                activeFiltersCount > 0
                  ? "Try adjusting your filters or search terms to find more campaigns."
                  : "There are no campaigns available at the moment."
              }
              action={activeFiltersCount > 0 ? (
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-white text-black rounded-sm font-semibold hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity"
                >
                  Clear Filters
                </button>
              ) : null}
            />
          ) : isLoading ? (
            <CampaignCardSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setIsFiltersOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-background-dark border-l border-border p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-serif text-text-primary">Filters</h3>
                  <button
                    onClick={() => setIsFiltersOpen(false)}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-surface/50 border border-border rounded-xl text-text-primary focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                    >
                      <option value="all">All Campaigns</option>
                      <option value="Active">Active</option>
                      <option value="Successful">Successful</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-surface/50 border border-border rounded-xl text-text-primary focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      Goal Range: {formatDOT(goalRange[0])} - {formatDOT(goalRange[1])} DOT
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={goalRange[0]}
                      onChange={(e) => setGoalRange([Number(e.target.value), goalRange[1]])}
                      className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={goalRange[1]}
                      onChange={(e) => setGoalRange([goalRange[0], Number(e.target.value)])}
                      className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary mt-4"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryToggle(category)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all border ${selectedCategories.includes(category)
                            ? 'bg-white text-black border-primary'
                            : 'bg-surface/50 border-border text-text-secondary hover:text-text-primary hover:border-text-muted'
                            }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-6 py-3 bg-surface text-text-primary rounded-xl hover:bg-surface/80 font-medium transition-colors"
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
