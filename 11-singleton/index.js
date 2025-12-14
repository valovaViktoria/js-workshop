/**
 * Singleton Pattern Implementation
 */

/**
 * Basic Singleton Class
 *
 * A class that only allows one instance to exist.
 */
class Singleton {
  // Step 1: Create a static property to hold the instance
  static instance = null;
  static _allowConstruction = false;

  // Step 2: Create a getInstance static method
  // - Check if instance exists
  // - If not, create it
  // - Return the instance
  static getInstance() {
    if (this.instance === null) {
      this._allowConstruction = true;
      this.instance = new Singleton();
      this._allowConstruction = false;
    }

    return this.instance;
  }

  // Step 3: Optionally prevent direct instantiation
  constructor() {
    if (!Singleton._allowConstruction) {
      throw new Error('Use Singleton.getInstance()');
    }
  }

  // Step 4: Add a reset method for testing
  static resetInstance() {
    this.instance = null;
    this._allowConstruction = false;
  }
}

/**
 * Singleton Factory
 *
 * Converts any class into a singleton.
 *
 * @param {Function} Class - The class to make singleton
 * @returns {Object} Object with getInstance method
 */
function createSingleton(Class) {
  // Step 1: Create a closure variable to hold the instance
  let instance = null;

  // Step 2: Return an object with getInstance method
  // getInstance should:
  //   - Accept arguments to pass to constructor
  //   - Only create instance on first call
  //   - Return the same instance on subsequent calls

  // Step 3: Optionally add resetInstance method
  return {
    getInstance: (...args) => {
      instance = instance ?? new Class(...args);

      return instance;
    },
    resetInstance: () => {
      instance = null;
    },
  };
}

/**
 * Example: Database Connection Singleton
 *
 * A practical example of a singleton for database connections.
 */
class DatabaseConnection {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.connected = false;
  }

  connect() {
    if (!this.connected) {
      // Simulate connection
      this.connected = true;
      console.log(`Connected to ${this.connectionString}`);
    }
    return this;
  }

  query(sql) {
    if (!this.connected) {
      throw new Error("Not connected");
    }
    return `Executing: ${sql}`;
  }

  disconnect() {
    this.connected = false;
  }
}

/**
 * Example: Configuration Singleton
 *
 * A practical example of a singleton for app configuration.
 */
class AppConfig {
  constructor() {
    this.settings = {};
  }

  set(key, value) {
    this.settings[key] = value;
    return this;
  }

  get(key) {
    return this.settings[key];
  }

  getAll() {
    return { ...this.settings };
  }
}

module.exports = {
  Singleton,
  createSingleton,
  DatabaseConnection,
  AppConfig,
};
