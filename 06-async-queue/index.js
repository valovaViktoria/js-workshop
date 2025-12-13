/**
 * Async Queue Implementation
 *
 * A queue that processes async tasks with concurrency control.
 */
class AsyncQueue {
  /**
   * Create an async queue
   * @param {Object} options - Queue options
   * @param {number} [options.concurrency=1] - Maximum concurrent tasks
   * @param {boolean} [options.autoStart=true] - Start processing immediately
   */
  constructor(options = {}) {
    // Step 1: Extract options with defaults
    // this.concurrency = options.concurrency || 1;
    // this.autoStart = options.autoStart !== false;
    // Step 2: Initialize internal state
    // this.queue = [];        // Pending tasks
    // this.running = 0;       // Currently running count
    // this.paused = false;    // Paused state
    // this.emptyCallbacks = []; // Callbacks for empty event
    const { concurrency = 1, autoStart = true } = options;
    this.concurrency = concurrency;
    this.autoStart = autoStart;

    this.queue = [];
    this.running = 0;
    this.paused = false;
    this.emptyCallbacks = [];
  }

  /**
   * Add a task to the queue
   * @param {Function} task - Async function to execute
   * @param {Object} [options] - Task options
   * @param {number} [options.priority=0] - Task priority (higher = sooner)
   * @returns {Promise} Resolves when task completes
   */
  add(task, options = {}) {
    let entryResolve;
    let entryReject;

    // Step 1: Create a new Promise and store its resolve/reject
    const promise = new Promise((resolve, reject) => {
      entryResolve = resolve;
      entryReject = reject;
    });

    // Step 2: Create task entry with: task, priority, resolve, reject
    const entry = {
      task,
      priority: options.priority ?? 0,
      resolve: entryResolve,
      reject: entryReject,
    };

    // Step 3: Add to queue (consider priority ordering)
    this.queue.push(entry);
    this.queue.sort((a, b) => b.priority - a.priority);

    // Step 4: Try to process if autoStart and not paused
    if (this.autoStart && !this.paused) 
      this._process();

    // Step 5: Return the promise
    return promise;
  }

  /**
   * Start processing the queue
   */
  start() {
    // Set paused to false and trigger processing
    this.paused = false;
    this._process();
  }

  /**
   * Pause the queue (running tasks will complete)
   */
  pause() {
    // Set paused to true
    this.paused = true;
  }

  /**
   * Clear all pending tasks
   */
  clear() {
    // Empty the queue array
    // Optionally: reject pending promises with an error
    // for (const entry of this.queue) {
    //   try{
    //     const error = new Error('Rejected during clearing queue');
    //     entry.reject(error);
    //   } catch (e){}

    // }
    this.queue.length = 0;
  }

  /**
   * Register callback for when queue becomes empty
   * @param {Function} callback - Called when queue is empty
   */
  onEmpty(callback) {
    // Store callback to be called when size becomes 0 and nothing running
    this.emptyCallbacks.push(callback);
  }

  /**
   * Number of pending tasks
   * @returns {number}
   */
  get size() {
    return this.queue.length;
  }

  /**
   * Number of currently running tasks
   * @returns {number}
   */
  get pending() {
    return this.running;
  }

  /**
   * Whether queue is paused
   * @returns {boolean}
   */
  get isPaused() {
    return this.paused;
  }

  /**
   * Internal: Process next tasks from queue
   * @private
   */
  _process() {
    // Step 1: Check if we can run more tasks
    // - Not paused
    // - Running count < concurrency
    // - Queue has items
    // Step 2: Take task from queue (respect priority)
    // Step 3: Increment running count
    // Step 4: Execute task and handle result
    // - On success: resolve the task's promise
    // - On error: reject the task's promise
    // - Always: decrement running, call _process again, check if empty
    while (this.running < this.concurrency 
      && !this.paused 
      && this.queue.length !== 0) {
      const entry = this.queue.shift();
      this.running++;

      Promise.resolve(entry.task())
        .then(
          value => entry.resolve(value),
          error => entry.reject(error)
        )
        .finally(() => {
          this.running--;
          this._checkEmpty();
          this._process();
        });
    }
  }

  /**
   * Internal: Check and trigger empty callbacks
   * @private
   */
  _checkEmpty() {
    if (this.queue.length === 0 && this.running === 0) {
      this.emptyCallbacks.forEach(callback => callback());

      this.emptyCallbacks.length = 0;
    }
  }
}

module.exports = { AsyncQueue };
