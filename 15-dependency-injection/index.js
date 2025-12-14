/**
 * Dependency Injection Container Implementation
 */
class Container {
  constructor() {
    this.registry = new Map();
  }

  /**
   * Register a class with the container
   * @param {string} name - Service name
   * @param {Function} Class - Constructor function
   * @param {string[]} [dependencies=[]] - Names of dependencies
   * @param {Object} [options={}] - Registration options
   * @param {boolean} [options.singleton=false] - Whether to create singleton
   */
  register(name, Class, dependencies = [], options = {}) {
    // Store in registry:
    // { type: 'class', Class, dependencies, singleton, instance: null }
    this.registry.set(name, {
      type: "class",
      Class,
      dependencies,
      singleton: options.singleton || false,
      instance: null,
    });
  }

  /**
   * Register an existing instance
   * @param {string} name - Service name
   * @param {*} instance - Instance to register
   */
  registerInstance(name, instance) {
    // Store in registry:
    // { type: 'instance', instance }
    this.registry.set(name, {
      type: "instance",
      instance: instance,
      singleton: true,
    });
  }

  /**
   * Register a factory function
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   * @param {string[]} [dependencies=[]] - Names of dependencies
   * @param {Object} [options={}] - Registration options
   */
  registerFactory(name, factory, dependencies = [], options = {}) {
    // Store in registry:
    // { type: 'factory', factory, dependencies, singleton, instance: null }
    this.registry.set(name, {
      type: "factory",
      factory,
      dependencies,
      singleton: options.singleton || false,
      instance: null,
    });
  }

  /**
   * Resolve a service by name
   * @param {string} name - Service name
   * @param {Set} [resolutionStack] - Stack for circular dependency detection
   * @returns {*} The resolved instance
   */
  resolve(name, resolutionStack = new Set()) {
    // Step 1: Check if service is registered
    // Throw error if not found
    if (!this.registry.has(name)) 
      throw new Error(`Service '${name}' is not registered`);

    // Step 2: Check for circular dependencies
    // If name is already in resolutionStack, throw error
    if (resolutionStack.has(name)) 
      throw new Error(`Circular dependency detected: ${Array.from(resolutionStack).join(" => ")} => ${name}`);

    // Step 3: Get registration from registry
    const registration = this.registry.get(name);

    let instance;

    // Step 4: Handle different types:
    switch (registration.type) {
      case "instance":
        instance = registration.instance;
        break;
      case "class":
      case "factory":
        if (registration.singleton && registration.instance) {
          instance = registration.instance;
        } else {
          resolutionStack.add(name);
          try {
            const resolvedDependencies = registration.dependencies.map(dep =>
              this.resolve(dep, resolutionStack)
            );

            if (registration.type === "class") {
              instance = new registration.Class(...resolvedDependencies);
            } else {
              instance = registration.factory(...resolvedDependencies);
            }
          } finally {
            resolutionStack.delete(name);
          }
        }
        break;
      default:
        throw new Error(`Unknown registration type: ${registration.type}`);
    }

    if (registration.singleton && !registration.instance) 
      registration.instance = instance;

    return instance;

    // For 'instance':
    //   - Return the stored instance

    // For 'class' or 'factory':
    //   - If singleton and instance exists, return instance
    //   - Add name to resolutionStack
    //   - Resolve all dependencies recursively
    //   - Create instance (new Class(...deps) or factory(...deps))
    //   - Remove name from resolutionStack
    //   - If singleton, cache instance
    //   - Return instance
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean}
   */
  has(name) {
    return this.registry.has(name);
  }

  /**
   * Unregister a service
   * @param {string} name - Service name
   * @returns {boolean} true if was registered
   */
  unregister(name) {
    return this.registry.delete(name);
  }

  /**
   * Clear all registrations
   */
  clear() {
    this.registry.clear();
  }

  /**
   * Get all registered service names
   * @returns {string[]}
   */
  getRegistrations() {
    return [...this.registry.keys()];
  }
}

/**
 * Create a child container that inherits from parent
 *
 * @param {Container} parent - Parent container
 * @returns {Container} Child container
 */
function createChildContainer(parent) {
  // Create a new container that:
  // - First checks its own registry
  // - Falls back to parent for unregistered services

  const child = new Container();
  const originalResolve = child.resolve.bind(child);
  const originalHas = child.has.bind(child);

  // Override resolve to check parent...
  child.resolve = (name, resolutionStack = new Set()) => {
    if (child.registry.has(name)) {
      return originalResolve(name, resolutionStack);
    }

    return parent.resolve(name, resolutionStack);
  };

  // Override has to check parent as well
  child.has = (name) => {
    return originalHas(name) || parent.has(name);
  };

  return child;
}

// Example classes for testing
class Logger {
  constructor() {
    this.logs = [];
  }

  log(message) {
    this.logs.push(message);
  }

  getLogs() {
    return [...this.logs];
  }
}

class Database {
  constructor(logger) {
    this.logger = logger;
    this.connected = false;
  }

  connect() {
    this.logger.log("Database connected");
    this.connected = true;
  }

  query(sql) {
    this.logger.log(`Query: ${sql}`);
    return [];
  }
}

class UserRepository {
  constructor(database, logger) {
    this.database = database;
    this.logger = logger;
  }

  findById(id) {
    this.logger.log(`Finding user ${id}`);
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

class UserService {
  constructor(userRepository, logger) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  getUser(id) {
    this.logger.log(`Getting user ${id}`);
    return this.userRepository.findById(id);
  }
}

module.exports = {
  Container,
  createChildContainer,
  Logger,
  Database,
  UserRepository,
  UserService,
};
