import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import { useCampaign } from '../contexts/CampaignContext';

export const CampaignSearch = ({ onFilteredCampaigns }) => {
  const { campaigns } = useCampaign();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [progressRange, setProgressRange] = useState([0, 100]);
  const [activeFilters, setActiveFilters] = useState([]);

  // Get unique categories from campaigns
  const categories = [...new Set(campaigns.map(c => c.category).filter(Boolean))];

  const applyFilters = useCallback(() => {
    let filtered = [...campaigns];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(campaign => campaign.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(campaign => {
        const progress = (campaign.totalRaised / campaign.goal) * 100;
        const isActive = new Date(campaign.deadline) > new Date();
        
        switch (selectedStatus) {
          case 'active':
            return isActive;
          case 'completed':
            return progress >= 100;
          case 'expired':
            return !isActive;
          default:
            return true;
        }
      });
    }

    // Apply progress range filter
    filtered = filtered.filter(campaign => {
      const progress = (campaign.totalRaised / campaign.goal) * 100;
      return progress >= progressRange[0] && progress <= progressRange[1];
    });

    onFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, selectedCategory, selectedStatus, progressRange, onFilteredCampaigns]);

  // Update active filters display
  useEffect(() => {
    const newFilters = [];
    if (searchTerm) newFilters.push({ type: 'search', value: searchTerm });
    if (selectedCategory) newFilters.push({ type: 'category', value: selectedCategory });
    if (selectedStatus) newFilters.push({ type: 'status', value: selectedStatus });
    if (progressRange[0] !== 0 || progressRange[1] !== 100) {
      newFilters.push({ type: 'progress', value: `${progressRange[0]}%-${progressRange[1]}%` });
    }
    setActiveFilters(newFilters);
  }, [searchTerm, selectedCategory, selectedStatus, progressRange]);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('');
        break;
      case 'category':
        setSelectedCategory('');
        break;
      case 'status':
        setSelectedStatus('');
        break;
      case 'progress':
        setProgressRange([0, 100]);
        break;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search and Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </motion.div>

        {/* Category Select */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Status Select */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </motion.div>
      </div>

      {/* Progress Range Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">Progress Range</span>
          </div>
          <span className="text-sm font-semibold text-purple-600">
            {progressRange[0]}% - {progressRange[1]}%
          </span>
        </div>
        
        {/* Custom Range Slider */}
        <div className="relative pt-1">
          <div className="relative h-2 bg-gray-200 rounded-full">
            {/* Filled Track */}
            <div
              className="absolute h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{
                left: `${progressRange[0]}%`,
                right: `${100 - progressRange[1]}%`
              }}
            />
            {/* Min Thumb */}
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressRange[0]}
              onChange={(e) => {
                const newMin = Math.min(parseInt(e.target.value), progressRange[1] - 5);
                setProgressRange([newMin, progressRange[1]]);
              }}
              className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
            />
            {/* Max Thumb */}
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressRange[1]}
              onChange={(e) => {
                const newMax = Math.max(parseInt(e.target.value), progressRange[0] + 5);
                setProgressRange([progressRange[0], newMax]);
              }}
              className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-pink-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
            />
          </div>
        </div>
      </motion.div>

      {/* Active Filters */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {activeFilters.map((filter, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium shadow-lg"
              >
                <span className="capitalize">{filter.type}:</span>
                <span>{filter.value}</span>
                <button
                  onClick={() => removeFilter(filter.type)}
                  className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors"
                  aria-label={`Remove ${filter.type} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

CampaignSearch.propTypes = {
  onFilteredCampaigns: PropTypes.func.isRequired,
};