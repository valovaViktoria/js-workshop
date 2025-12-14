/**
 * LRU Cache Implementation
 *
 * A cache that evicts the least recently used items when at capacity.
 */
class LRUCache {
  /**
   * Create an LRU Cache
   * @param {number} capacity - Maximum number of items
   */
  constructor(capacity) {
    // Step 1: Store capacity
    this.capacity = capacity;
    // Step 2: Create storage (Map recommended)
    this.cache = new Map();
  }

  /**
   * Get value by key
   * @param {*} key - Cache key
   * @returns {*} Value or undefined if not found
   */
  get(key) {
    // Step 1: Check if key exists

    // Step 2: If exists:
    //   - Get the value
    //   - Move to end (most recent)
    //   - Return value
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }

    // Step 3: If not exists, return undefined
    return undefined;
  }

  /**
   * Set key-value pair
   * @param {*} key - Cache key
   * @param {*} value - Value to store
   */
  put(key, value) {
    // Step 1: If key already exists, delete it first (to update position)
    // Step 2: If at capacity, evict least recently used (first item)
    // Step 3: Add the new key-value pair (goes to end = most recent)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.size === this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  /**
   * Check if key exists (without updating recency)
   * @param {*} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete a key
   * @param {*} key - Cache key
   * @returns {boolean} true if key existed
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all items
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Current number of items
   * @returns {number}
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Get all keys in order (least recent first)
   * @returns {Array} Array of keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values in order (least recent first)
   * @returns {Array} Array of values
   */
  values() {
    return Array.from(this.cache.values());
  }
}

module.exports = { LRUCache };
