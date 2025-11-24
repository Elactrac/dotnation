/**
 * Content Type Definitions and Constants
 * 
 * Defines the structure and types for creator content posts
 */

/**
 * Content Types
 */
export const CONTENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  PDF: 'pdf',
};

/**
 * Content Type Labels
 */
export const CONTENT_TYPE_LABELS = {
  [CONTENT_TYPES.TEXT]: 'Text Post',
  [CONTENT_TYPES.IMAGE]: 'Image',
  [CONTENT_TYPES.VIDEO]: 'Video',
  [CONTENT_TYPES.PDF]: 'PDF Document',
};

/**
 * Supported MIME types for each content type
 */
export const SUPPORTED_MIME_TYPES = {
  [CONTENT_TYPES.TEXT]: [
    'text/plain',
    'text/markdown',
    'text/html',
  ],
  [CONTENT_TYPES.IMAGE]: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  [CONTENT_TYPES.VIDEO]: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
  ],
  [CONTENT_TYPES.PDF]: [
    'application/pdf',
  ],
};

/**
 * File size limits (in MB)
 */
export const FILE_SIZE_LIMITS = {
  [CONTENT_TYPES.TEXT]: 1, // 1MB
  [CONTENT_TYPES.IMAGE]: 10, // 10MB
  [CONTENT_TYPES.VIDEO]: 100, // 100MB
  [CONTENT_TYPES.PDF]: 50, // 50MB
};

/**
 * Post status
 */
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

/**
 * Content Post Structure (matches IPFS metadata)
 * @typedef {Object} ContentPost
 * @property {string} id - Unique post ID (UUID or timestamp)
 * @property {string} title - Post title
 * @property {string} description - Post description/preview
 * @property {string} contentType - Content type (text|image|video|pdf)
 * @property {string} contentHash - IPFS hash of the content
 * @property {string} contentUrl - Full IPFS gateway URL
 * @property {string} [thumbnailHash] - Optional thumbnail IPFS hash
 * @property {string} [thumbnailUrl] - Optional thumbnail IPFS URL
 * @property {string} metadataHash - IPFS hash of the complete metadata
 * @property {string} metadataUrl - Full IPFS URL for metadata
 * @property {string} requiredTier - Required tier ID to access content
 * @property {string} creator - Creator wallet address
 * @property {number} timestamp - Creation timestamp (Unix ms)
 * @property {string} status - Post status (draft|published|archived)
 * @property {number} [views] - View count
 * @property {number} [likes] - Like count
 * @property {string} [fileName] - Original filename (for files)
 * @property {number} [fileSize] - File size in bytes
 */

/**
 * Content Metadata (minimal structure for backend storage)
 * @typedef {Object} ContentMetadata
 * @property {string} postId - Post ID
 * @property {string} creator - Creator address
 * @property {string} metadataHash - IPFS metadata hash
 * @property {string} requiredTier - Required tier
 * @property {number} timestamp - Creation timestamp
 * @property {string} status - Post status
 */

/**
 * Creator Profile with Content Stats
 * @typedef {Object} CreatorProfile
 * @property {string} address - Wallet address
 * @property {string} name - Creator name
 * @property {string} avatar - Avatar URL
 * @property {string} bio - Biography
 * @property {number} totalPosts - Total post count
 * @property {number} totalSubscribers - Total subscribers
 * @property {Array<ContentPost>} recentPosts - Recent posts
 */

/**
 * Validate post data structure
 * @param {Object} post - Post data to validate
 * @returns {boolean}
 */
export const validatePostData = (post) => {
  const requiredFields = [
    'title',
    'description',
    'contentType',
    'contentHash',
    'requiredTier',
    'creator',
    'timestamp',
  ];

  for (const field of requiredFields) {
    if (!post[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!Object.values(CONTENT_TYPES).includes(post.contentType)) {
    throw new Error(`Invalid content type: ${post.contentType}`);
  }

  return true;
};

/**
 * Create initial post data structure
 * @param {Object} params
 * @returns {Object}
 */
export const createPostData = ({
  title,
  description,
  contentType,
  requiredTier,
  creator,
}) => {
  return {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title.trim(),
    description: description.trim(),
    contentType,
    requiredTier,
    creator,
    timestamp: Date.now(),
    status: POST_STATUS.DRAFT,
    views: 0,
    likes: 0,
  };
};

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get content type icon
 * @param {string} contentType
 * @returns {string}
 */
export const getContentTypeIcon = (contentType) => {
  const icons = {
    [CONTENT_TYPES.TEXT]: '📝',
    [CONTENT_TYPES.IMAGE]: '🖼️',
    [CONTENT_TYPES.VIDEO]: '🎥',
    [CONTENT_TYPES.PDF]: '📄',
  };
  
  return icons[contentType] || '📦';
};

/**
 * Check if content type supports preview
 * @param {string} contentType
 * @returns {boolean}
 */
export const supportsPreview = (contentType) => {
  return [CONTENT_TYPES.TEXT, CONTENT_TYPES.IMAGE].includes(contentType);
};

/**
 * Get accept string for file input
 * @param {string} contentType
 * @returns {string}
 */
export const getAcceptString = (contentType) => {
  const mimeTypes = SUPPORTED_MIME_TYPES[contentType] || [];
  return mimeTypes.join(',');
};

export default {
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  SUPPORTED_MIME_TYPES,
  FILE_SIZE_LIMITS,
  POST_STATUS,
  validatePostData,
  createPostData,
  formatFileSize,
  getContentTypeIcon,
  supportsPreview,
  getAcceptString,
};
