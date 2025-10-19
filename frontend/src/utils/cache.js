/**
 * Caching utilities for DotNation
 * Implements multi-layer caching with TTL support
 */

export class CacheManager {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 60000; // Default 60 seconds
    this.maxSize = options.maxSize || 100; // Default 100 items
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Set a cache entry
   */
  set(key, value, customTtl) {
    // Evict oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      console.log('[Cache] Evicted oldest entry:', oldestKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (customTtl || this.ttl),
      createdAt: Date.now(),
    });

    console.log(`[Cache] Set: ${key} (TTL: ${customTtl || this.ttl}ms)`);
  }

  /**
   * Get a cache entry
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.missCount++;
      console.log(`[Cache] Miss: ${key}`);
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.missCount++;
      console.log(`[Cache] Expired: ${key}`);
      return null;
    }
    
    this.hitCount++;
    console.log(`[Cache] Hit: ${key}`);
    return item.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete a specific entry
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[Cache] Deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Invalidate entries matching a pattern
   */
  invalidate(pattern) {
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (this.matchesPattern(key, pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    console.log(`[Cache] Invalidated ${count} entries matching: ${pattern}`);
    return count;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    console.log(`[Cache] Cleared ${size} entries`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: hitRate.toFixed(2) + '%',
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Remove expired entries
   */
  prune() {
    const now = Date.now();
    let pruned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        pruned++;
      }
    }
    
    if (pruned > 0) {
      console.log(`[Cache] Pruned ${pruned} expired entries`);
    }
    
    return pruned;
  }

  /**
   * Helper to match key against pattern
   */
  matchesPattern(key, pattern) {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(key);
    }
    return key.startsWith(pattern);
  }
}

/**
 * Higher-level cache wrapper for async operations
 */
export class AsyncCache {
  constructor(cache) {
    this.cache = cache || new CacheManager();
    this.pendingRequests = new Map();
  }

  /**
   * Get value or compute it if not cached
   * Prevents duplicate requests (request coalescing)
   */
  async getOrCompute(key, computeFn, ttl) {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Check if already computing
    if (this.pendingRequests.has(key)) {
      console.log(`[AsyncCache] Waiting for pending request: ${key}`);
      return await this.pendingRequests.get(key);
    }

    // Compute value
    console.log(`[AsyncCache] Computing: ${key}`);
    const promise = computeFn()
      .then(value => {
        this.cache.set(key, value, ttl);
        this.pendingRequests.delete(key);
        return value;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return await promise;
  }

  /**
   * Invalidate cache and clear pending requests
   */
  invalidate(pattern) {
    this.cache.invalidate(pattern);
    
    // Clear matching pending requests
    for (const key of this.pendingRequests.keys()) {
      if (this.cache.matchesPattern(key, pattern)) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Clear everything
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

/**
 * LocalStorage-backed cache for persistence
 */
export class PersistentCache extends CacheManager {
  constructor(options = {}) {
    super(options);
    this.storageKey = options.storageKey || 'dotnation-cache';
    this.loadFromStorage();
  }

  set(key, value, customTtl) {
    super.set(key, value, customTtl);
    this.saveToStorage();
  }

  delete(key) {
    const result = super.delete(key);
    this.saveToStorage();
    return result;
  }

  clear() {
    super.clear();
    localStorage.removeItem(this.storageKey);
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.cache = new Map(parsed.entries);
        console.log(`[PersistentCache] Loaded ${this.cache.size} entries from storage`);
        
        // Prune expired entries
        this.prune();
      }
    } catch (error) {
      console.warn('[PersistentCache] Failed to load from storage:', error);
    }
  }

  saveToStorage() {
    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        savedAt: Date.now(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[PersistentCache] Failed to save to storage:', error);
    }
  }
}

// Create global cache instances
export const memoryCache = new CacheManager({ ttl: 30000, maxSize: 100 }); // 30 sec
export const asyncCache = new AsyncCache(memoryCache);
export const persistentCache = new PersistentCache({ ttl: 300000, maxSize: 50 }); // 5 min

// Auto-prune expired entries every minute
setInterval(() => {
  memoryCache.prune();
  persistentCache.prune();
}, 60000);

// Make caches available in development
if (import.meta.env.DEV) {
  window.cache = {
    memory: memoryCache,
    async: asyncCache,
    persistent: persistentCache,
  };
}

export default CacheManager;
