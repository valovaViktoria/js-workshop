/**
 * Middleware Pipeline Implementation
 *
 * An Express/Koa-style middleware pipeline.
 */
class Pipeline {
  constructor() {
    this.middleware = [];
  }

  /**
   * Add middleware to the pipeline
   * @param {Function} fn - Middleware function (ctx, next) => {}
   * @returns {Pipeline} this (for chaining)
   */
  use(fn) {
    // Step 1: Validate fn is a function
    if (!(fn instanceof Function))
      throw new TypeError("Middleware must be a function");

    // Step 2: Add to middleware array
    this.middleware.push(fn);

    // Step 3: Return this for chaining
    return this;
  }

  /**
   * Execute the pipeline with given context
   * @param {Object} context - Context object passed to all middleware
   * @returns {Promise} Resolves when pipeline completes
   */
  run(context) {
    // Step 1: Create a dispatch function that:
    //   - Takes an index
    //   - Gets middleware at that index
    //   - If no middleware, resolve
    //   - Otherwise, call middleware with context and next function
    //   - next = () => dispatch(index + 1)
    const dispatch = index => {
      const middleware = this.middleware[index];
      if (!middleware)
        return Promise.resolve();

      let called = false;
      const next = () => {
        if (called) {
          return Promise.reject(new Error("next() called multiple times"));
        }
        called = true;
        return dispatch(index + 1);
      };

      try {
        const result = middleware(context, next);
        return Promise.resolve(result);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    // Step 2: Start dispatch at index 0
    return dispatch(0);

    // Step 3: Return promise for async support
  }

  /**
   * Compose middleware into a single function
   * @returns {Function} Composed middleware function
   */
  compose() {
    // Return a function that takes context and runs the pipeline

    return (context) => this.run(context);
  }
}

/**
 * Compose function (standalone)
 *
 * Composes an array of middleware into a single function.
 *
 * @param {Function[]} middleware - Array of middleware functions
 * @returns {Function} Composed function (context) => Promise
 */
function compose(middleware) {
  // Validate all items are functions
  if (!middleware.every(fn => fn instanceof Function)) 
    throw new Error("All items in middleware array must be functions");

  // Return a function that:
  // - Takes context
  // - Creates dispatch(index) that calls middleware[index]
  // - Returns dispatch(0)

  return function (context) {
    function dispatch(index) {
      // Step 1: Get middleware at index
      const mw = middleware[index];
      // Step 2: If none, return resolved promise
      if (!mw) 
        return Promise.resolve();

      // Step 3: Create next function = () => dispatch(index + 1)
      // Step 4: Call middleware with (context, next)
      // Step 5: Handle multiple next() calls
      let called = false;
      const next = () => {
        if (called) {
          return Promise.reject(new Error("next() called multiple times"));
        }
        called = true;
        return dispatch(index + 1);
      };

      try {
        const result = mw(context, next);
        // Step 6: Return as promise
        return Promise.resolve(result);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return dispatch(0);
  };
}

/**
 * Create a middleware that runs conditionally
 *
 * @param {Function} condition - (ctx) => boolean
 * @param {Function} middleware - Middleware to run if condition is true
 * @returns {Function} Conditional middleware
 */
function when(condition, middleware) {
  // Return middleware that:
  // - Checks condition(ctx)
  // - If true, runs middleware
  // - If false, just calls next()

  return (ctx, next) => {
    if (condition(ctx)) {
      return middleware(ctx, next);
    } else {
      return next();
    }
  };
}

/**
 * Create a middleware that handles errors
 *
 * @param {Function} errorHandler - (error, ctx) => {}
 * @returns {Function} Error handling middleware
 */
function errorMiddleware(errorHandler) {
  // Return middleware that:
  // - Wraps next() in try/catch
  // - Calls errorHandler if error thrown

  return async (ctx, next) => {
    try {
      return await next();
    } catch (e) {
      return errorHandler(e, ctx);
    }
  };
}

module.exports = {
  Pipeline,
  compose,
  when,
  errorMiddleware,
};
