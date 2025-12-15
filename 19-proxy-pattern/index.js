/**
 * Proxy Pattern Implementation
 */

/**
 * Create a validating proxy
 *
 * @param {Object} target - Target object
 * @param {Object} validators - Map of property name to validator function
 * @returns {Proxy} Proxy that validates on set
 */
function createValidatingProxy(target, validators) {
  // Create a Proxy with a handler that:
  // - On 'set': check if validator exists for property
  //   - If validator returns false, throw Error
  //   - Otherwise, set the property
  // - On 'get': return property value normally

  return new Proxy(target, {
    // Check validators[prop](value) if validator exists
    // Throw if validation fails
    // Set property if passes
    set(obj, prop, value) {
      if (validators[prop]) {
        if (!validators[prop](value)) {
          throw new Error(`Invalid value: ${value} for property: ${prop}`);
        }
      }      

      return Reflect.set(obj, prop, value);
    },

    get(obj, prop) {
      const value = Reflect.get(obj, prop);

      if (typeof value === "function") 
        return value.bind(obj);

      return value;
    },
  });
}

/**
 * Create a logging proxy
 *
 * @param {Object} target - Target object
 * @param {Function} logger - Logging function (action, prop, value) => void
 * @returns {Proxy} Proxy that logs all operations
 */
function createLoggingProxy(target, logger) {
  return new Proxy(target, {
    get(obj, prop) {
      const value = Reflect.get(obj, prop);
      logger("get", prop, value);

      return value;
    },

    set(obj, prop, value) {
      const result = Reflect.set(obj, prop, value);
      logger("set", prop, value);

      return result;
    },

    deleteProperty(obj, prop) {
      const result = Reflect.deleteProperty(obj, prop);
      logger("delete", prop);

      return result;
    },

    has(obj, prop) {
      const result = Reflect.has(obj, prop);
      logger("has", prop, result);
      
      return result;
    },
  });
}

/**
 * Create a caching proxy for methods
 *
 * @param {Object} target - Target object with methods
 * @param {string[]} methodNames - Names of methods to cache
 * @returns {Proxy} Proxy that caches method results
 */
function createCachingProxy(target, methodNames) {
  const cache = new Map();
  const methods = new Set(methodNames);

  return new Proxy(target, {
    get(obj, prop) {
    // If prop is in methodNames and is a function:
    //   Return a wrapped function that:
    //   - Creates cache key from arguments
    //   - Returns cached result if exists
    //   - Otherwise, calls original, caches, and returns

    // Otherwise, return property normally
      const value = Reflect.get(obj, prop);

      if (!methods.has(prop) || typeof value !== "function")
        return value;  

      return function (...args) {
        const key = `${prop}:${JSON.stringify(args)}`;

        if (cache.has(key)) 
          return cache.get(key);      

        const result = value.apply(obj, args);

        cache.set(key, result);

        return result;
      };
    },
  });
}

/**
 * Create an access control proxy
 *
 * @param {Object} target - Target object
 * @param {Object} permissions - Access permissions
 * @param {string[]} permissions.readable - Properties that can be read
 * @param {string[]} permissions.writable - Properties that can be written
 * @returns {Proxy} Proxy that enforces access control
 */
function createAccessProxy(target, permissions) {
  const { readable = [], writable = [] } = permissions;

  const readableProps = new Set(readable);
  const writableProps = new Set(writable);

  return new Proxy(target, {
    get(obj, prop) {
    // Throw if not allowed
      if (!readableProps.has(prop)) 
        throw new Error(`Access denied to read property: ${prop}`);
      
      return Reflect.get(obj, prop);
    },

    set(obj, prop, value) {
      if (!writableProps.has(prop)) 
    // Throw if not allowed
        throw new Error(`Access denied to write property: ${prop}`);
      
      return Reflect.set(obj, prop, value);
    },

    deleteProperty(obj, prop) {
      if (!writableProps.has(prop)) 
        throw new Error(`Access denied to delete property: ${prop}`);
      
      return Reflect.deleteProperty(obj, prop);
    },
  });
}

/**
 * Create a lazy loading proxy
 *
 * @param {Function} loader - Function that returns the real object
 * @returns {Proxy} Proxy that loads object on first access
 */
function createLazyProxy(loader) {
  let instance = null;
  let loaded = false;

  return new Proxy(
    {},
    {
      get(obj, prop) {
      // if (!loaded) { instance = loader(); loaded = true; }
        if (!loaded) {
          instance = loader();
          loaded = true;
        }

        return Reflect.get(instance, prop);
      },

      set(obj, prop, value) {
        if (!loaded) {
          instance = loader();
          loaded = true;
        }

        return Reflect.set(instance, prop, value);
      },
    }
  );
}

/**
 * Create an observable proxy
 *
 * @param {Object} target - Target object
 * @param {Function} onChange - Callback when property changes
 * @returns {Proxy} Proxy that notifies on changes
 */
function createObservableProxy(target, onChange) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      const result = Reflect.set(obj, prop, value);
      onChange(prop, value, oldValue);

      return result;
    },

    deleteProperty(obj, prop) {
      const oldValue = obj[prop];
      const result = Reflect.deleteProperty(obj, prop);
      onChange(prop, undefined, oldValue);

      return result;
    },
  });
}

module.exports = {
  createValidatingProxy,
  createLoggingProxy,
  createCachingProxy,
  createAccessProxy,
  createLazyProxy,
  createObservableProxy,
};
