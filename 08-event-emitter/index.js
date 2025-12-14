/**
 * Event Emitter Implementation
 *
 * A pub/sub event system similar to Node.js EventEmitter.
 */
class EventEmitter {
  constructor() {
    // this.events = new Map(); // or {}
    this.events = new Map();
  }

  /**
   * Register a listener for an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   * @returns {EventEmitter} this (for chaining)
   */
  on(event, listener) {
    // Step 1: Get or create the listeners array for this event
    if (!this.events.has(event)) 
      this.events.set(event, []);

    // Step 2: Add the listener to the array
    this.events.get(event).push(listener);

    // Step 3: Return this for chaining
    return this;
  }

  /**
   * Remove a specific listener for an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback to remove
   * @returns {EventEmitter} this (for chaining)
   */
  off(event, listener) {
    // Step 1: Get the listeners array for this event
    const listeners = this.events.get(event);
    if (!listeners) 
      return this;

    // Step 2: Find and remove the listener
    // Note: Handle wrapped 'once' listeners
    const listenerIdx = 
      listeners.findIndex(item => item === listener || item._origin === listener);

    if (listenerIdx !== -1) 
      listeners.splice(listenerIdx, 1);

    if(listeners.length === 0)
      this.events.delete(event); 

    // Step 3: Return this for chaining
    return this;
  }

  /**
   * Emit an event, calling all registered listeners
   * @param {string} event - Event name
   * @param {...*} args - Arguments to pass to listeners
   * @returns {boolean} true if event had listeners
   */
  emit(event, ...args) {
    // Step 1: Get the listeners array for this event (already a copy)
    const listeners = this.listeners(event);

    // Step 2: If no listeners, return false
    if (listeners.length === 0) 
      return false;

    // Step 3: Call each listener with the arguments
    // Note: listeners is already a copy, safe to iterate even if removals occur
    listeners.forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`emit: error in listener for event '${event}':`, error);
      }
    });

    // Step 4: Return true
    return true;
  }

  /**
   * Register a one-time listener
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   * @returns {EventEmitter} this (for chaining)
   */
  once(event, listener) {
    // Step 1: Create a wrapper function that:
    //   - Removes itself after being called
    //   - Calls the original listener with arguments
    function wrapped(...args) {
      this.off(event, wrapped);
      listener.apply(this, args);
    }

    // Step 2: Store reference to original listener for 'off' to work
    wrapped._origin = listener;

    // Step 3: Register the wrapper with 'on'
    this.on(event, wrapped);

    // Step 4: Return this for chaining
    return this;
  }

  /**
   * Remove all listeners for an event (or all events)
   * @param {string} [event] - Event name (optional)
   * @returns {EventEmitter} this (for chaining)
   */
  removeAllListeners(event) {
    // If event is provided, remove only that event's listeners
    // If no event, clear all events
    if (event !== undefined) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }

    return this;
  }

  /**
   * Get array of listeners for an event
   * @param {string} event - Event name
   * @returns {Function[]} Array of listener functions
   */
  listeners(event) {
    // Return copy of listeners array, or empty array if none
    const eventListeners = this.events.get(event);

    return eventListeners ? [...eventListeners] : [];
  }

  /**
   * Get number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Listener count
   */
  listenerCount(event) {
    const eventListeners = this.events.get(event);

    return eventListeners ? eventListeners.length : 0;
  }
}

module.exports = { EventEmitter };
