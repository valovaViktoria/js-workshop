/**
 * State Machine Implementation
 */
class StateMachine {
  /**
   * Create a state machine
   * @param {Object} config - Machine configuration
   * @param {string} config.initial - Initial state
   * @param {Object} config.states - State definitions
   * @param {Object} [config.context] - Initial context data
   */
  constructor(config) {
    // Step 1: Validate config has initial and states
    if (!config.initial || !config.states) 
      throw new Error("Invalid configuration: missing 'initial' or 'states' property");
    

    // Step 2: Store configuration
    this.config = config;
    this.currentState = config.initial;
    this.context = config.context || {};

    // Step 3: Validate initial state exists in states
    if (!config.states[config.initial]) 
      throw new Error(`Invalid initial state: ${config.initial} does not exist in states`);
    
  }

  /**
   * Get current state
   * @returns {string}
   */
  get state() {
    return this.currentState;
  }

  /**
   * Attempt a state transition
   * @param {string} event - Event name
   * @param {Object} [payload] - Optional data for the transition
   * @returns {boolean} Whether transition was successful
   */
  transition(event, payload) {
    // Step 1: Get current state config
    const currentStateConfig = this.config.states[this.currentState];

    // Step 2: Check if event is valid for current state
    // Return false if not
    if (!currentStateConfig.on || !currentStateConfig.on[event]) 
      return false;

    // Step 3: Get transition config (can be string or object)
    // If string: target = transition
    // If object: { target, guard, action }
    const transitionConfig = currentStateConfig.on[event];
    if (typeof transitionConfig === "string") {
      const target = transitionConfig;
      if (!this.config.states[target]) 
        throw new Error(`Target state '${target}' does not exist`);

      this.currentState = target;
    } else {
      const { target, guard, action } = transitionConfig;
      if (!this.config.states[target]) 
        throw new Error(`Target state '${target}' does not exist`);

      // Step 4: Check guard if present
      // If guard returns false, return false
      if (guard && !guard(this.context, payload)) 
        return false;

      // Step 5: Update state to target
      this.currentState = target;

      // Step 6: Call action if present
      if (action)
         action(this.context, payload);
    }

    // Step 7: Return true
    return true;
  }

  /**
   * Check if a transition is possible
   * @param {string} event - Event name
   * @param {Object} [payload] - Optional payload for guard evaluation
   * @returns {boolean}
   */
  can(event, payload) {
    // Check if event exists for current state
    // Check guard if present
    const currentStateConfig = this.config.states[this.currentState];

    if (!currentStateConfig.on || !currentStateConfig.on[event]) 
      return false;

    const transitionConfig = currentStateConfig.on[event];

    if (typeof transitionConfig === "string") {
      if (!this.config.states[transitionConfig]) 
        throw new Error(`Target state '${transitionConfig}' does not exist`);

      return true;
    }

    const { guard } = transitionConfig;

    if (guard) 
      return guard(this.context, payload);

    return true;
  }

  /**
   * Get available transitions from current state
   * @returns {string[]} Array of event names
   */
  getAvailableTransitions() {
    // Return array of event names from current state's 'on' config
    const currentStateConfig = this.config.states[this.currentState];

    return Object.keys(currentStateConfig.on || {});
  }

  /**
   * Get the context data
   * @returns {Object}
   */
  getContext() {
    return this.context;
  }

  /**
   * Update context data
   * @param {Object|Function} updater - New context or updater function
   */
  updateContext(updater) {
    // If updater is function: this.context = updater(this.context)
    if (typeof updater === "function") {
      this.context = updater(this.context);
    } else {
      // If updater is object: merge with existing context
      this.context = { ...this.context, ...updater };
    }
  }

  /**
   * Check if machine is in a final state (no transitions out)
   * @returns {boolean}
   */
  isFinal() {
    const transitions = this.config.states[this.currentState].on;

    return (
      !transitions ||
      (Array.isArray(transitions) && transitions.length === 0) ||
      (typeof transitions === "object" && Object.keys(transitions).length === 0)
    );
  }

  /**
   * Reset machine to initial state
   * @param {Object} [newContext] - Optional new context
   */
  reset(newContext) {
    this.currentState = this.config.initial;

    if (newContext !== undefined) {
      this.context = typeof newContext === "object" && newContext !== null
          ? { ...newContext }
          : newContext;
    }
  }
}

/**
 * Create a state machine factory
 *
 * @param {Object} config - Machine configuration
 * @returns {Function} Factory function that creates machines
 */
function createMachine(config) {
  // Return a function that creates new StateMachine instances
  // with the given config

  return () => new StateMachine(config);
}

module.exports = { StateMachine, createMachine };
