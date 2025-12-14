/**
 * Decorator Pattern Implementation
 */

/**
 * Logging Decorator
 *
 * Wraps a function to log its calls and return values.
 *
 * @param {Function} fn - Function to decorate
 * @returns {Function} Decorated function
 */
function withLogging(fn) {
  // Step 1: Return a new function that wraps fn
  return function (...args) {
    // Step 2: Log the function name and arguments
    const functionName = fn.name || "anonymous";
    console.log(`Calling ${functionName} with args: ${JSON.stringify(args)}`);

    // Step 3: Call the original function
    const value = fn.apply(this, args);

    // Step 4: Log the return value
    console.log(`${functionName} returned: ${value}`);

    // Step 5: Return the result
    return value;
  };
  // Note: Preserve 'this' context using apply/call
}

/**
 * Timing Decorator
 *
 * Wraps a function to measure and log execution time.
 *
 * @param {Function} fn - Function to decorate
 * @returns {Function} Decorated function
 */
function withTiming(fn) {
  // Step 1: Return a new function
  return function (...args) {
    // Step 2: Record start time (performance.now() or Date.now())
    const start = Date.now();

    // Step 3: Call original function
    const value = fn.apply(this, args);

    // Step 4: Calculate and log duration
    const functionName = fn.name || "anonymous";
    const duration = Date.now() - start;
    console.log(`${functionName} took ${duration}ms`);

    // Step 5: Return result
    return value;
  };
}

/**
 * Retry Decorator
 *
 * Wraps a function to retry on failure.
 *
 * @param {Function} fn - Function to decorate
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Function} Decorated function
 */
function withRetry(fn, maxRetries = 3) {
  // Step 1: Return a new function
  return function (...args) {
    // Step 2: Track attempt count

    let lastError;

    // Step 3: Loop up to maxRetries:
    //   - Try to call fn
    //   - On success, return result
    //   - On failure, increment attempts and continue
    for (let attempt = 0; attempt < maxRetries + 1; attempt++) {
      try {
        const result = fn.apply(this, args);

        return result;
      } catch (e) {
        lastError = e;
      }
    }

    // Step 4: If all retries fail, throw the last error
    throw lastError;
  };
}

/**
 * Memoize Decorator
 *
 * Wraps a function to cache results based on arguments.
 *
 * @param {Function} fn - Function to decorate
 * @returns {Function} Decorated function with cache
 */
function withMemoize(fn) {
  // Similar to memoization assignment but as a decorator
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const value = fn.apply(this, args);
    cache.set(key, value);
    return value;
  };
}

/**
 * Validation Decorator
 *
 * Wraps a function to validate arguments before calling.
 *
 * @param {Function} fn - Function to decorate
 * @param {Function} validator - Validation function (returns boolean)
 * @returns {Function} Decorated function
 */
function withValidation(fn, validator) {
  // Step 1: Return a new function
  return function (...args) {
    // Step 2: Call validator with arguments
    if (!validator(...args)) {
      // Step 3: If validation fails, throw error
      throw new Error("Validation failed");
    }

    // Step 4: If passes, call original function
    return fn.apply(this, args);
  };
}

/**
 * Cache Object Method Decorator
 *
 * Decorates an object method to cache its results.
 *
 * @param {Object} obj - Object containing the method
 * @param {string} methodName - Name of method to cache
 * @returns {Object} Object with cached method
 */
function withCache(obj, methodName) {
  // Step 1: Get the original method
  const method = obj[methodName];

  // Step 2: Create a cache (Map)
  const cache = new Map();

  function cacheWrapper(...args) {
    const key = methodName + JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = method.apply(this, args);
    cache.set(key, result);
    return result;
  }

  // Step 3: Replace the method with a caching wrapper
  obj[methodName] = cacheWrapper;

  // Step 4: Return the object
  return obj;
}

/**
 * Compose Decorators
 *
 * Composes multiple decorators into one.
 * Decorators are applied right-to-left.
 *
 * @param {...Function} decorators - Decorator functions
 * @returns {Function} Composed decorator
 */
function compose(...decorators) {
  // Return a function that takes fn and applies all decorators
  return function (fn) {
    return decorators.reduceRight((wrappedFn, decorator) => decorator(wrappedFn), fn);
  };
  // Example: compose(a, b, c)(fn) = a(b(c(fn)))
}

/**
 * Pipe Decorators
 *
 * Like compose but applies left-to-right.
 *
 * @param {...Function} decorators - Decorator functions
 * @returns {Function} Piped decorator
 */
function pipe(...decorators) {
  // Same as compose but left-to-right
  return function (fn) {
    return decorators.reduce((wrappedFn, decorator) => decorator(wrappedFn), fn);
  };
}

// Storage for logs (used in tests)
const logs = [];

function log(message) {
  logs.push(message);
  // console.log(message); // Uncomment for debugging
}

function clearLogs() {
  logs.length = 0;
}

function getLogs() {
  return [...logs];
}

module.exports = {
  withLogging,
  withTiming,
  withRetry,
  withMemoize,
  withValidation,
  withCache,
  compose,
  pipe,
  log,
  clearLogs,
  getLogs,
};
