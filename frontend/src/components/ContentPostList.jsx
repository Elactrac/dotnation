/**
 * Content Post List Component
 * 
 * Displays a list of creator's posts with management actions
 * Shows post stats, status, and allows editing/deletion
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  FiEye, 
  FiHeart, 
  FiEdit, 
  FiTrash2, 
  FiClock,
  FiLock,
  FiExternalLink
} from 'react-icons/fi';
import { 
  CONTENT_TYPE_LABELS,
  POST_STATUS,
  getContentTypeIcon
} from '../utils/contentTypes';

const ContentPostList = ({ 
  posts = [], 
  tiers = [],
  onEdit,
  onDelete,
  onView,
  loading = false
}) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Get tier name by ID
  const getTierName = (tierId) => {
    const tier = tiers.find(t => t.id === tierId);
    return tier?.name || 'Unknown Tier';
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return formatDate(timestamp);
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (selectedFilter === 'all') return true;
    return post.status === selectedFilter;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.timestamp - a.timestamp;
      case 'views':
        return (b.views || 0) - (a.views || 0);
      case 'likes':
        return (b.likes || 0) - (a.likes || 0);
      default:
        return 0;
    }
  });

  // Handle delete with confirmation
  const handleDelete = (post) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      onDelete(post);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiEdit className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
          No content yet
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start creating content for your subscribers. Upload images, videos, PDFs, or write text posts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and sorting */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedFilter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setSelectedFilter(POST_STATUS.PUBLISHED)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedFilter === POST_STATUS.PUBLISHED
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Published ({posts.filter(p => p.status === POST_STATUS.PUBLISHED).length})
          </button>
          <button
            onClick={() => setSelectedFilter(POST_STATUS.DRAFT)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedFilter === POST_STATUS.DRAFT
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Drafts ({posts.filter(p => p.status === POST_STATUS.DRAFT).length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="date">Date</option>
            <option value="views">Views</option>
            <option value="likes">Likes</option>
          </select>
        </div>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPosts.map((post) => (
          <div 
            key={post.id || post.metadataHash} 
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
          >
            {/* Thumbnail or content type icon */}
            <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              {post.thumbnailUrl ? (
                <img 
                  src={post.thumbnailUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : post.contentType === 'image' && post.contentUrl ? (
                <img 
                  src={post.contentUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-6xl text-gray-400">
                  {getContentTypeIcon(post.contentType)}
                </div>
              )}
              
              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  post.status === POST_STATUS.PUBLISHED
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-white'
                }`}>
                  {post.status === POST_STATUS.PUBLISHED ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Content type badge */}
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                  {CONTENT_TYPE_LABELS[post.contentType]}
                </span>
              </div>

              {/* Quick actions overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {onView && (
                  <button
                    onClick={() => onView(post)}
                    className="p-3 bg-white text-black rounded-full hover:bg-gray-100 transition-colors"
                    title="View post"
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                )}
                <a
                  href={post.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white text-black rounded-full hover:bg-gray-100 transition-colors"
                  title="Open in IPFS"
                >
                  <FiExternalLink className="w-5 h-5" />
                </a>
                {onEdit && (
                  <button
                    onClick={() => onEdit(post)}
                    className="p-3 bg-white text-black rounded-full hover:bg-gray-100 transition-colors"
                    title="Edit post"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Post info */}
            <div className="p-4">
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                {post.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {post.description}
              </p>

              {/* Meta info */}
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  {formatTimeAgo(post.timestamp)}
                </div>
                {post.status === POST_STATUS.PUBLISHED && (
                  <>
                    <div className="flex items-center gap-1">
                      <FiEye className="w-4 h-4" />
                      {post.views || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiHeart className="w-4 h-4" />
                      {post.likes || 0}
                    </div>
                  </>
                )}
              </div>

              {/* Tier badge */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <FiLock className="w-4 h-4" />
                  <span>{getTierName(post.requiredTier)}</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(post)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(post)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {sortedPosts.length === 0 && posts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No posts found with the selected filters.</p>
        </div>
      )}
    </div>
  );
};

ContentPostList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired,
    contentUrl: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string,
    requiredTier: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    timestamp: PropTypes.number.isRequired,
    views: PropTypes.number,
    likes: PropTypes.number,
  })).isRequired,
  tiers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  loading: PropTypes.bool,
};

export default ContentPostList;
