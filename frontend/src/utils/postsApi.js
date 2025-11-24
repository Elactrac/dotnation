/**
 * Posts API Utility
 * 
 * Functions to interact with the backend API for IPFS-based posts
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Save post metadata to backend
 * @param {Object} postData - Post data with IPFS hashes
 * @returns {Promise<Object>} Response with saved post
 */
export const savePostToBackend = async (postData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/members/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creatorAddress: postData.creator,
        metadataHash: postData.metadataHash,
        contentHash: postData.contentHash,
        contentType: postData.contentType,
        title: postData.title,
        description: postData.description,
        requiredTier: postData.requiredTier,
        status: postData.status,
        thumbnailHash: postData.thumbnailHash,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save post');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving post to backend:', error);
    throw error;
  }
};

/**
 * Fetch all posts for a creator
 * @param {string} creatorAddress - Creator's wallet address
 * @param {Object} options - Optional filters
 * @returns {Promise<Object>} Posts data with pagination
 */
export const fetchCreatorPosts = async (creatorAddress, options = {}) => {
  try {
    const { status, limit = 50, offset = 0 } = options;
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (status) {
      queryParams.append('status', status);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/members/posts/${creatorAddress}?${queryParams}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch posts');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching creator posts:', error);
    throw error;
  }
};

/**
 * Fetch a specific post
 * @param {string} creatorAddress - Creator's wallet address
 * @param {string} postId - Post ID (metadata hash)
 * @returns {Promise<Object>} Post data
 */
export const fetchPost = async (creatorAddress, postId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/members/posts/${creatorAddress}/${postId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch post');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

/**
 * Update a post
 * @param {string} postId - Post ID (metadata hash)
 * @param {string} creatorAddress - Creator's wallet address
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated post data
 */
export const updatePost = async (postId, creatorAddress, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/members/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creatorAddress,
        ...updates,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update post');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {string} postId - Post ID (metadata hash)
 * @param {string} creatorAddress - Creator's wallet address
 * @returns {Promise<Object>} Success response
 */
export const deletePost = async (postId, creatorAddress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/members/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creatorAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete post');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Like a post
 * @param {string} postId - Post ID (metadata hash)
 * @param {string} userAddress - User's wallet address
 * @returns {Promise<Object>} Updated likes count
 */
export const likePost = async (postId, userAddress) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/members/posts/${postId}/like`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to like post');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};
