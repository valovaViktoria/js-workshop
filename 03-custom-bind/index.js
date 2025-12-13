/**
 * Custom Bind Implementation
 *
 * Creates a new function that, when called, has its `this` keyword set to
 * the provided context, with a given sequence of arguments preceding any
 * provided when the new function is called.
 *
 * @param {Function} fn - The function to bind
 * @param {*} context - The value to bind as `this`
 * @param {...*} boundArgs - Arguments to prepend to the bound function
 * @returns {Function} A new bound function
 */
function customBind(fn, context, ...boundArgs) {
  // Step 1: Validate that fn is a function
  // Throw TypeError if not
  if (typeof fn !== 'function')
    throw new TypeError(`customBind: invalid type 'fn' argument: ${typeof fn}`);

  // Step 2: Create the bound function
  // It should:
  //   - Combine boundArgs with any new arguments
  //   - Call the original function with the combined arguments
  //   - Use the correct `this` context
  function bound(...args) {
    // Step 3: Handle constructor calls (when used with `new`)
    // When called as a constructor:
    //   - `this` should be a new instance, not the bound context
    //   - The prototype chain should be preserved
    if (new.target) {
      const result = fn.apply(this, [...boundArgs, ...args]);

      return result && result instanceof Object ? result : this;
    }

    return fn.apply(context, [...boundArgs, ...args]);
  }

  // Step 4: Preserve the prototype for constructor usage
  if (fn.prototype) {
    bound.prototype = Object.create(fn.prototype);
  }

  // Step 5: Return the bound function
  return bound;
}

/**
 * BONUS: Prototype Method Implementation
 *
 * Add customBind to Function.prototype so it can be called as:
 * myFunction.customBind(context, ...args)
 */

// Uncomment and implement:
Function.prototype.customBind = function (context, ...boundArgs) {
  return customBind(this, context, ...boundArgs);
};

module.exports = { customBind };
