/**
 * Observable Implementation
 *
 * A simple Observable for reactive data streams.
 */
class Observable {
  /**
   * Create an Observable
   * @param {Function} subscribeFn - Function called with subscriber on subscribe
   */
  constructor(subscribeFn) {
    this._subscribeFn = subscribeFn;
  }

  /**
   * Subscribe to the Observable
   * @param {Object|Function} observer - Observer object or next callback
   * @returns {Object} Subscription with unsubscribe method
   */
  subscribe(observer) {
    // Step 1: Normalize observer (handle function shorthand)
    // If observer is a function, wrap it: { next: observer }
    if (typeof observer === 'function') {
      observer = {
        next: observer,
      };
    }

    // Step 2: Create a subscriber object that:
    //   - Has next, error, complete methods
    //   - Tracks if completed/errored (stops accepting values)
    //   - Calls observer methods when appropriate
    const subscriber = {
      completed: false,
      errored: false,
      next(value) {
        if (subscriber.completed || subscriber.errored) return;
        observer.next && observer.next(value);
      },
      error(err) {
        if (subscriber.completed || subscriber.errored) return;
        subscriber.errored = true;
        observer.error && observer.error(err);
      },
      complete() {
        if (subscriber.completed || subscriber.errored) return;
        subscriber.completed = true;
        observer.complete && observer.complete();
      },
    };

    // Step 3: Call the subscribe function with the subscriber

    // Step 4: Handle cleanup function returned by subscribeFn
    const cleanup = this._subscribeFn(subscriber);

    // Step 5: Return subscription object with unsubscribe method
    return {
      unsubscribe() {
        if (cleanup && typeof cleanup === 'function') cleanup();

        subscriber.completed = true;
        subscriber.errored = true;
      },
    };
  }

  /**
   * Transform each emitted value
   * @param {Function} fn - Transform function
   * @returns {Observable} New Observable with transformed values
   */
  map(fn) {
    // Return new Observable that:
    // - Subscribes to source (this)
    // - Calls fn on each value
    // - Emits transformed value
    return new Observable(subscriber => {
      const subscription = this.subscribe({
        next(value) {
          subscriber.next(fn(value));
        },
        error(e) {
          subscriber.error(e);
        },
        complete() {
          subscriber.complete();
        },
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Filter emitted values
   * @param {Function} predicate - Filter function
   * @returns {Observable} New Observable with filtered values
   */
  filter(predicate) {
    // Return new Observable that:
    // - Subscribes to source (this)
    // - Only emits values where predicate returns true

    return new Observable(subscriber => {
      const subscription = this.subscribe({
        next(value) {
          if (predicate(value)) {
            subscriber.next(value);
          }
        },
        error(e) {
          subscriber.error(e);
        },
        complete() {
          subscriber.complete();
        },
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Take only first n values
   * @param {number} count - Number of values to take
   * @returns {Observable} New Observable limited to count values
   */
  take(count) {
    // Return new Observable that:
    // - Subscribes to source (this)
    // - Emits first `count` values
    // - Completes after `count` values
    return new Observable(subscriber => {
      let taken = 0;
      let completed = false;

      const subscription = this.subscribe({
        next(value) {
          if (taken < count) {
            subscriber.next(value);
            taken++;

            if (taken === count) {
              completed = true;
              subscriber.complete();
            }
          }
        },
        error(e) {
          subscriber.error(e);
        },
        complete() {
          if (!completed) {
            subscriber.complete();
          }
        },
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Skip first n values
   * @param {number} count - Number of values to skip
   * @returns {Observable} New Observable that skips first count values
   */
  skip(count) {
    // Return new Observable that:
    // - Subscribes to source (this)
    // - Ignores first `count` values
    // - Emits remaining values

    return new Observable(subscriber => {
      let skipped = 0;
      
      const subscription = this.subscribe({
        next(value) {
          if (skipped < count) {
            skipped++;
            return;
          }

          subscriber.next(value);
        },
        error(e) {
          subscriber.error(e);
        },
        complete() {
          subscriber.complete();
        },
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Create Observable from array
   * @param {Array} array - Array of values
   * @returns {Observable} Observable that emits array values
   */
  static from(array) {
    // Return new Observable that:
    // - Emits each array element
    // - Completes after last element
    return new Observable(subscriber => {
      // subscriber.next(...) for each
      // subscriber.complete()
      array.forEach(value => subscriber.next(value));

      subscriber.complete();

      return () => {};
    });
  }

  /**
   * Create Observable from single value
   * @param {*} value - Value to emit
   * @returns {Observable} Observable that emits single value
   */
  static of(...values) {
    // Return new Observable that emits all values then completes

    return Observable.from(values);
  }
}

module.exports = { Observable };
