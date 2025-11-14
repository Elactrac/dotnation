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
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  closeRedis,
  sessionOps,
  rateLimitOps,
  fraudOps,
  cacheOps
};
