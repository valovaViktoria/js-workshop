/**
 * Memoization Implementation
 *
 * Creates a memoized version of a function that caches results based on arguments.
 *
 * @param {Function} fn - The function to memoize
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.maxSize] - Maximum number of cached entries
 * @param {number} [options.ttl] - Time-to-live for cache entries in milliseconds
 * @param {Function} [options.keyGenerator] - Custom function to generate cache keys
 * @returns {Function} Memoized function with cache control methods
 */
function memoize(fn, options = {}) {
  // Step 1: Extract options with defaults
  const { 
    maxSize = Infinity, 
    ttl = Infinity, 
    keyGenerator = defaultKeyGenerator,
  } = options;

  // Step 2: Create the cache (use Map for ordered keys)
  const cache = new Map();

  // Step 3: Create default key generator
  // Default: JSON.stringify(args) or args.join(',')
  function defaultKeyGenerator(args) {
    return JSON.stringify(args);
  }

  // Step 4: Create the memoized function
  // - Generate cache key from arguments
  // - Check if key exists and is not expired (TTL)
  // - If cached, return cached value
  // - If not cached, call fn and store result
  // - Handle maxSize eviction (remove oldest)
  function memoized(...args) {
    const key = keyGenerator(args);
    const now = Date.now();    

    const cached = cache.get(key);

    if (cached) {
      if (now - cached.timestamp < ttl) {
        return cached.value;
      }

      cache.delete(key);
    }

    const value = fn.apply(this, args);

    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, {
      value,
      timestamp: now,
    });

    return value;
  }

  // Step 5: Add cache control methods
  memoized.cache = {
    clear: () => cache.clear(),
    delete: key => cache.delete(key),
    has: key => cache.has(key),
    get size() {
      return cache.size;
    },
  };

  return memoized;
}

module.exports = { memoize };
