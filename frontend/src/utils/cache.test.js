/**
 * Test suite for cache utilities
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CacheManager, AsyncCache, PersistentCache } from '../cache';

describe('CacheManager', () => {
  let cache;

  beforeEach(() => {
    cache = new CacheManager({ ttl: 1000, maxSize: 3 });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for missing keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should delete entries', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('TTL Expiration', () => {
    it('should expire entries after TTL', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(1001);
      expect(cache.get('key1')).toBeNull();
    });

    it('should support custom TTL per entry', () => {
      cache.set('short', 'value1', 500);
      cache.set('long', 'value2', 2000);

      vi.advanceTimersByTime(600);
      expect(cache.get('short')).toBeNull();
      expect(cache.get('long')).toBe('value2');

      vi.advanceTimersByTime(1500);
      expect(cache.get('long')).toBeNull();
    });
  });

  describe('Size Limits', () => {
    it('should evict oldest entry when full', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // Should evict key1

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });
  });

  describe('Pattern Invalidation', () => {
    it('should invalidate by exact prefix', () => {
      cache.set('user:1', 'data1');
      cache.set('user:2', 'data2');
      cache.set('post:1', 'data3');

      cache.invalidate('user');

      expect(cache.get('user:1')).toBeNull();
      expect(cache.get('user:2')).toBeNull();
      expect(cache.get('post:1')).toBe('data3');
    });

    it('should invalidate by wildcard pattern', () => {
      cache.set('user:1:profile', 'data1');
      cache.set('user:2:profile', 'data2');
      cache.set('user:1:settings', 'data3');

      cache.invalidate('user:1:*');

      expect(cache.get('user:1:profile')).toBeNull();
      expect(cache.get('user:1:settings')).toBeNull();
      expect(cache.get('user:2:profile')).toBe('data2');
    });
  });

  describe('Pruning', () => {
    it('should prune expired entries', () => {
      cache.set('key1', 'value1', 500);
      cache.set('key2', 'value2', 1500);

      vi.advanceTimersByTime(600);
      cache.prune();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.cache.size).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key2'); // miss
      cache.get('key3'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe('50.00%');
    });

    it('should return current size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(3);
    });
  });

  describe('Clear', () => {
    it('should clear all entries and stats', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.get('key1');

      cache.clear();

      expect(cache.cache.size).toBe(0);
      expect(cache.hitCount).toBe(0);
      expect(cache.missCount).toBe(0);
    });
  });
});

describe('AsyncCache', () => {
  let cache;
  let asyncCache;

  beforeEach(() => {
    cache = new CacheManager({ ttl: 1000 });
    asyncCache = new AsyncCache(cache);
  });

  it('should compute and cache value', async () => {
    const computeFn = vi.fn().mockResolvedValue('computed');

    const result = await asyncCache.getOrCompute('key1', computeFn);

    expect(result).toBe('computed');
    expect(computeFn).toHaveBeenCalledTimes(1);

    // Should return cached value
    const cached = await asyncCache.getOrCompute('key1', computeFn);
    expect(cached).toBe('computed');
    expect(computeFn).toHaveBeenCalledTimes(1);
  });

  it('should coalesce duplicate requests', async () => {
    const computeFn = vi.fn().mockResolvedValue('computed');

    // Start multiple concurrent requests
    const promise1 = asyncCache.getOrCompute('key1', computeFn);
    const promise2 = asyncCache.getOrCompute('key1', computeFn);
    const promise3 = asyncCache.getOrCompute('key1', computeFn);

    const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

    expect(result1).toBe('computed');
    expect(result2).toBe('computed');
    expect(result3).toBe('computed');
    expect(computeFn).toHaveBeenCalledTimes(1); // Only computed once!
  });

  it('should handle computation errors', async () => {
    const computeFn = vi.fn().mockRejectedValue(new Error('Failed'));

    await expect(
      asyncCache.getOrCompute('key1', computeFn)
    ).rejects.toThrow('Failed');

    // Should retry on next call
    computeFn.mockResolvedValue('success');
    const result = await asyncCache.getOrCompute('key1', computeFn);
    expect(result).toBe('success');
  });

  it('should invalidate pattern and pending requests', () => {
    cache.set('user:1', 'data1');
    cache.set('user:2', 'data2');
    asyncCache.pendingRequests.set('user:3', Promise.resolve('pending'));

    asyncCache.invalidate('user:*');

    expect(cache.get('user:1')).toBeNull();
    expect(asyncCache.pendingRequests.size).toBe(0);
  });
});

describe('PersistentCache', () => {
  let persistentCache;

  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      store: {},
      getItem(key) {
        return this.store[key] || null;
      },
      setItem(key, value) {
        this.store[key] = value.toString();
      },
      removeItem(key) {
        delete this.store[key];
      },
      clear() {
        this.store = {};
      },
    };

    persistentCache = new PersistentCache({ ttl: 5000 });
  });

  it('should persist to localStorage', () => {
    persistentCache.set('key1', 'value1');

    const stored = JSON.parse(localStorage.getItem('dotnation-cache'));
    expect(stored.entries).toHaveLength(1);
    expect(stored.entries[0][0]).toBe('key1');
  });

  it('should load from localStorage on init', () => {
    // Pre-populate localStorage
    const data = {
      entries: [
        ['key1', { value: 'value1', expiry: Date.now() + 10000, createdAt: Date.now() }],
        ['key2', { value: 'value2', expiry: Date.now() + 10000, createdAt: Date.now() }],
      ],
      savedAt: Date.now(),
    };
    localStorage.setItem('dotnation-cache', JSON.stringify(data));

    // Create new instance
    const newCache = new PersistentCache({ ttl: 5000 });

    expect(newCache.get('key1')).toBe('value1');
    expect(newCache.get('key2')).toBe('value2');
  });

  it('should clear localStorage on clear()', () => {
    persistentCache.set('key1', 'value1');
    persistentCache.clear();

    expect(localStorage.getItem('dotnation-cache')).toBeNull();
  });
});
