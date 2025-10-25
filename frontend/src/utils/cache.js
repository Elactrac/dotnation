/**
 * @file Caching utilities for DotNation, implementing multi-layer caching with TTL support.
 * @exports CacheManager
 * @exports AsyncCache
 * @exports PersistentCache
 * @exports memoryCache
 * @exports asyncCache
 * @exports persistentCache
 */

/**
 * Manages in-memory caching with TTL and size limits.
 */
export class CacheManager {
  /**
   * Creates an instance of CacheManager.
   * @param {object} [options={}] - Configuration options for the cache.
   * @param {number} [options.ttl=60000] - Default time-to-live for cache entries in milliseconds.
   * @param {number} [options.maxSize=100] - Maximum number of entries in the cache.
   */
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 60000; // Default 60 seconds
    this.maxSize = options.maxSize || 100; // Default 100 items
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Sets a value in the cache.
   * @param {string} key - The key for the cache entry.
   * @param {*} value - The value to cache.
   * @param {number} [customTtl] - A custom TTL for this entry in milliseconds.
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
   * Retrieves a value from the cache.
   * @param {string} key - The key of the entry to retrieve.
   * @returns {*|null} The cached value, or null if not found or expired.
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
   * Checks if a key exists in the cache and is not expired.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key exists and is valid, false otherwise.
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
   * Deletes an entry from the cache.
   * @param {string} key - The key of the entry to delete.
   * @returns {boolean} True if the entry was deleted, false otherwise.
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[Cache] Deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Invalidates cache entries that match a given pattern.
   * @param {string} pattern - The pattern to match against cache keys. Can include '*' as a wildcard.
   * @returns {number} The number of invalidated entries.
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
   * Clears all entries from the cache.
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    console.log(`[Cache] Cleared ${size} entries`);
  }

  /**
   * Retrieves statistics about the cache.
   * @returns {object} An object containing cache statistics.
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
   * Removes all expired entries from the cache.
   * @returns {number} The number of pruned entries.
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
   * Matches a key against a pattern.
   * @param {string} key - The key to match.
   * @param {string} pattern - The pattern to match against.
   * @returns {boolean} True if the key matches the pattern.
   * @private
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
 * A higher-level cache wrapper for asynchronous operations, with request coalescing.
 */
export class AsyncCache {
  /**
   * Creates an instance of AsyncCache.
   * @param {CacheManager} [cache] - An optional CacheManager instance to use.
   */
  constructor(cache) {
    this.cache = cache || new CacheManager();
    this.pendingRequests = new Map();
  }

  /**
   * Retrieves a value from the cache, or computes it if not present.
   * This method prevents duplicate requests for the same key (request coalescing).
   * @param {string} key - The key for the cache entry.
   * @param {function(): Promise<*>} computeFn - An async function that computes the value if not cached.
   * @param {number} [ttl] - A custom TTL for this entry in milliseconds.
   * @returns {Promise<*>} A promise that resolves to the cached or computed value.
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
   * Invalidates cache entries and clears pending requests matching a pattern.
   * @param {string} pattern - The pattern to match against cache keys.
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
   * Clears the cache and all pending requests.
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

/**
 * A cache manager that persists data to localStorage.
 */
export class PersistentCache extends CacheManager {
  /**
   * Creates an instance of PersistentCache.
   * @param {object} [options={}] - Configuration options.
   * @param {string} [options.storageKey='dotnation-cache'] - The key to use for localStorage.
   */
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

  /**
   * Loads cache data from localStorage.
   * @private
   */
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

  /**
   * Saves cache data to localStorage.
   * @private
   */
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

/** An in-memory cache instance with a 30-second TTL. */
export const memoryCache = new CacheManager({ ttl: 30000, maxSize: 100 });
/** An async cache instance that uses the memoryCache. */
export const asyncCache = new AsyncCache(memoryCache);
/** A persistent cache instance with a 5-minute TTL. */
export const persistentCache = new PersistentCache({ ttl: 300000, maxSize: 50 });

// Auto-prune expired entries every minute
setInterval(() => {
  memoryCache.prune();
  persistentCache.prune();
}, 60000);

// Expose caches to the window object in development for debugging
if (import.meta.env.DEV) {
  window.cache = {
    memory: memoryCache,
    async: asyncCache,
    persistent: persistentCache,
  };
}

export default CacheManager;
