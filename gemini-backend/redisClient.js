/**
 * @file Redis Client Configuration
 * Production-ready Redis client with connection pooling and error handling
 */

const redis = require('redis');
const logger = require('./logger');

let redisClient = null;

/**
 * Initialize Redis client with retry strategy
 */
async function initializeRedis() {
  if (redisClient) {
    return redisClient;
  }

  const redisConfig = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('[Redis] Max reconnection attempts reached');
          return new Error('Max reconnection attempts reached');
        }
        // Exponential backoff: 50ms * 2^retries (max 3 seconds)
        return Math.min(50 * Math.pow(2, retries), 3000);
      },
      connectTimeout: 10000,
      keepAlive: 5000,
    },
    // Connection pooling
    isolationPoolOptions: {
      min: 2,
      max: 10
    }
  };

  redisClient = redis.createClient(redisConfig);

  // Error handling
  redisClient.on('error', (err) => {
    console.error('[Redis] Connection error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('[Redis] Connected successfully');
  });

  redisClient.on('reconnecting', () => {
    console.log('[Redis] Reconnecting...');
  });

  redisClient.on('ready', () => {
    console.log('[Redis] Client ready');
  });

  try {
    await redisClient.connect();
    console.log('[Redis] Initialization complete');
    return redisClient;
  } catch (error) {
    console.error('[Redis] Failed to connect:', error);
    throw error;
  }
}

/**
 * Get Redis client instance
 */
function getRedisClient() {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClient;
}

/**
 * Graceful shutdown
 */
async function closeRedis() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('[Redis] Connection closed');
  }
}

/**
 * Session operations with Redis
 */
const sessionOps = {
  /**
   * Create a new session
   */
  async createSession(sessionToken, data, ttlSeconds = 300) {
    const client = getRedisClient();
    const key = `session:${sessionToken}`;
    await client.setEx(key, ttlSeconds, JSON.stringify(data));
    return sessionToken;
  },

  /**
   * Get session data
   */
  async getSession(sessionToken) {
    const client = getRedisClient();
    const key = `session:${sessionToken}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Update session data
   */
  async updateSession(sessionToken, data, ttlSeconds = 300) {
    const client = getRedisClient();
    const key = `session:${sessionToken}`;
    const existing = await client.get(key);
    if (!existing) {
      throw new Error('Session not found');
    }
    const merged = { ...JSON.parse(existing), ...data };
    await client.setEx(key, ttlSeconds, JSON.stringify(merged));
  },

  /**
   * Delete session
   */
  async deleteSession(sessionToken) {
    const client = getRedisClient();
    const key = `session:${sessionToken}`;
    await client.del(key);
  },

  /**
   * Get all active sessions count
   */
  async getSessionCount() {
    const client = getRedisClient();
    const keys = await client.keys('session:*');
    return keys.length;
  }
};

/**
 * Rate limiting operations with Redis
 */
const rateLimitOps = {
  /**
   * Check and increment rate limit
   */
  async checkRateLimit(ip, maxRequests = 50, windowMs = 15 * 60 * 1000) {
    const client = getRedisClient();
    const key = `ratelimit:${ip}`;
    
    const count = await client.incr(key);
    
    // Set expiry on first request
    if (count === 1) {
      await client.pExpire(key, windowMs);
    }
    
    const ttl = await client.pTTL(key);
    
    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetTime: Date.now() + ttl
    };
  },

  /**
   * Reset rate limit for IP
   */
  async resetRateLimit(ip) {
    const client = getRedisClient();
    const key = `ratelimit:${ip}`;
    await client.del(key);
  },

  /**
   * Get rate limit stats
   */
  async getRateLimitStats() {
    const client = getRedisClient();
    const keys = await client.keys('ratelimit:*');
    return {
      totalIPs: keys.length
    };
  }
};

/**
 * Fraud database operations
 */
const fraudOps = {
  /**
   * Add campaign to fraud database
   */
  async addFraudCampaign(campaignData) {
    const client = getRedisClient();
    const key = `fraud:campaign:${campaignData.id}`;
    await client.set(key, JSON.stringify(campaignData));
    
    // Add to sorted set for easy retrieval
    await client.zAdd('fraud:campaigns', {
      score: Date.now(),
      value: campaignData.id
    });
  },

  /**
   * Get known fraud campaigns
   */
  async getFraudCampaigns(limit = 100) {
    const client = getRedisClient();
    const ids = await client.zRange('fraud:campaigns', 0, limit - 1, { REV: true });
    
    const campaigns = [];
    for (const id of ids) {
      const data = await client.get(`fraud:campaign:${id}`);
      if (data) {
        campaigns.push(JSON.parse(data));
      }
    }
    
    return campaigns;
  },

  /**
   * Check if campaign is in fraud database
   */
  async isFraudCampaign(campaignId) {
    const client = getRedisClient();
    const key = `fraud:campaign:${campaignId}`;
    const exists = await client.exists(key);
    return exists === 1;
  }
};

/**
 * Cache operations for AI responses
 */
const cacheOps = {
  /**
   * Set cached AI response
   */
  async setCachedResponse(key, data, ttlSeconds = 3600) {
    const client = getRedisClient();
    const cacheKey = `cache:ai:${key}`;
    await client.setEx(cacheKey, ttlSeconds, JSON.stringify(data));
  },

  /**
   * Get cached AI response
   */
  async getCachedResponse(key) {
    const client = getRedisClient();
    const cacheKey = `cache:ai:${key}`;
    const data = await client.get(cacheKey);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Clear cache
   */
  async clearCache(pattern = '*') {
    const client = getRedisClient();
    const keys = await client.keys(`cache:ai:${pattern}`);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return keys.length;
  },

  /**
   * Generic get operation
   */
  async get(key) {
    const client = getRedisClient();
    return await client.get(key);
  },

  /**
   * Generic set operation
   */
  async set(key, value, ttlSeconds) {
    const client = getRedisClient();
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  },

  /**
   * Generic delete operation
   */
  async del(key) {
    const client = getRedisClient();
    await client.del(key);
  }
};

/**
 * IPFS Posts operations with Redis
 */
const postsOps = {
  /**
   * Create a new post
   */
  async createPost(postData) {
    const client = getRedisClient();
    const postKey = `post:${postData.id}`;
    
    // Store post data
    await client.set(postKey, JSON.stringify(postData));
    
    // Add to creator's posts sorted set (sorted by timestamp)
    await client.zAdd(`creator-posts:${postData.creatorAddress}`, {
      score: postData.timestamp,
      value: postData.id
    });
    
    // Add to global posts sorted set
    await client.zAdd('posts:all', {
      score: postData.timestamp,
      value: postData.id
    });
    
    return postData;
  },

  /**
   * Get a specific post by ID
   */
  async getPost(postId) {
    const client = getRedisClient();
    const postKey = `post:${postId}`;
    const data = await client.get(postKey);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Get all posts for a creator
   */
  async getCreatorPosts(creatorAddress, options = {}) {
    const client = getRedisClient();
    const { status, limit = 50, offset = 0 } = options;
    
    // Get post IDs from sorted set (newest first)
    const postIds = await client.zRange(
      `creator-posts:${creatorAddress}`,
      0,
      -1,
      { REV: true }
    );
    
    if (postIds.length === 0) {
      return { posts: [], total: 0, limit, offset };
    }
    
    // Fetch all posts
    const posts = [];
    for (const postId of postIds) {
      const post = await this.getPost(postId);
      if (post) {
        // Filter by status if provided
        if (!status || post.status === status) {
          posts.push(post);
        }
      }
    }
    
    // Apply pagination
    const paginatedPosts = posts.slice(offset, offset + limit);
    
    return {
      posts: paginatedPosts,
      total: posts.length,
      limit,
      offset
    };
  },

  /**
   * Update a post
   */
  async updatePost(postId, creatorAddress, updates) {
    const client = getRedisClient();
    const post = await this.getPost(postId);
    
    if (!post || post.creatorAddress !== creatorAddress) {
      throw new Error('Post not found or unauthorized');
    }
    
    // Merge updates
    const updatedPost = { ...post, ...updates };
    
    // Save updated post
    const postKey = `post:${postId}`;
    await client.set(postKey, JSON.stringify(updatedPost));
    
    return updatedPost;
  },

  /**
   * Delete a post
   */
  async deletePost(postId, creatorAddress) {
    const client = getRedisClient();
    const post = await this.getPost(postId);
    
    if (!post || post.creatorAddress !== creatorAddress) {
      throw new Error('Post not found or unauthorized');
    }
    
    // Remove from Redis
    const postKey = `post:${postId}`;
    await client.del(postKey);
    
    // Remove from creator's sorted set
    await client.zRem(`creator-posts:${creatorAddress}`, postId);
    
    // Remove from global sorted set
    await client.zRem('posts:all', postId);
    
    return true;
  },

  /**
   * Increment post views
   */
  async incrementViews(postId) {
    const client = getRedisClient();
    const post = await this.getPost(postId);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    post.views += 1;
    
    const postKey = `post:${postId}`;
    await client.set(postKey, JSON.stringify(post));
    
    return post.views;
  },

  /**
   * Increment post likes
   */
  async incrementLikes(postId) {
    const client = getRedisClient();
    const post = await this.getPost(postId);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    post.likes += 1;
    
    const postKey = `post:${postId}`;
    await client.set(postKey, JSON.stringify(post));
    
    return post.likes;
  },

  /**
   * Get total posts count for a creator
   */
  async getCreatorPostsCount(creatorAddress) {
    const client = getRedisClient();
    return await client.zCard(`creator-posts:${creatorAddress}`);
  },

  /**
   * Get all posts (for admin/debugging)
   */
  async getAllPosts(limit = 100, offset = 0) {
    const client = getRedisClient();
    const postIds = await client.zRange('posts:all', 0, -1, { REV: true });
    
    const posts = [];
    for (const postId of postIds.slice(offset, offset + limit)) {
      const post = await this.getPost(postId);
      if (post) {
        posts.push(post);
      }
    }
    
    return {
      posts,
      total: postIds.length,
      limit,
      offset
    };
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  closeRedis,
  sessionOps,
  rateLimitOps,
  fraudOps,
  cacheOps,
  postsOps
};
