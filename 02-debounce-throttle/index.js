/**
 * Debounce Implementation
 *
 * Creates a debounced function that delays invoking `fn` until after `delay`
 * milliseconds have elapsed since the last time the debounced function was called.
 *
 * @param {Function} fn - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} The debounced function with a cancel() method
 */
function debounce(fn, delay) {
  // Parameter validation
  if (typeof fn !== 'function') {
    throw new TypeError(`debounce: invalid type 'fn' argument: ${typeof fn}`);
  }

  if (typeof delay !== 'number' || isNaN(delay)) {
    throw new TypeError(`debounce: invalid type 'delay' argument: ${typeof fn}`);
  }

  // Ensure delay is non-negative
  delay = Math.max(0, delay);

  // Step 1: Create a variable to store the timeout ID
  let timerId = null;

  // Step 2: Create the debounced function that:
  //   - Clears any existing timeout
  //   - Sets a new timeout to call fn after delay
  //   - Preserves `this` context and arguments
  function debounced(...args) {
    clearTimeout(timerId);

    timerId = setTimeout(() => fn.apply(this, args), delay);
  }

  // Step 3: Add a cancel() method to clear pending timeout
  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = null;
  };

  // Step 4: Return the debounced function
  return debounced;
}

/**
 * Throttle Implementation
 *
 * Creates a throttled function that only invokes `fn` at most once per
 * every `limit` milliseconds.
 *
 * @param {Function} fn - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} The throttled function with a cancel() method
 */
function throttle(fn, limit) {
  // Parameter validation
  if (typeof fn !== 'function') {
    throw new TypeError(`throttle: invalid type 'fn' argument: ${typeof fn}`);
  }

  if (typeof limit !== 'number' || isNaN(limit)) {
    throw new TypeError(`throttle: invalid type 'limit' argument: ${typeof fn}`);
  }

  // Ensure limit is non-negative
  limit = Math.max(0, limit);

  // Step 1: Create variables to track:
  //   - Whether we're currently in a throttle period
  //   - The timeout ID for cleanup
  let isThrottled = false;
  let timerId = null;

  // Step 2: Create the throttled function that:
  //   - If not throttling, execute fn immediately and start throttle period
  //   - If throttling, ignore the call
  //   - Preserves `this` context and arguments
  function throttled(...args) {
    if (!isThrottled) {
      fn.apply(this, args);

      isThrottled = true;

      timerId = setTimeout(() => (isThrottled = false), limit);
    }
  }

  // Step 3: Add a cancel() method to reset throttle state
  throttled.cancel = () => {
    isThrottled = false;
    clearTimeout(timerId);
    timerId = null;
  };

  // Step 4: Return the throttled function
  return throttled;
}

module.exports = { debounce, throttle };
