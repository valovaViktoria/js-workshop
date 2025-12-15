/**
 * Strategy Pattern Implementation
 */

// ============================================
// SORTING STRATEGIES
// ============================================

/**
 * Sort Context
 *
 * Delegates sorting to a strategy.
 */
class SortContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  sort(array) {
    // Return sorted copy, don't mutate original
    if (!this.strategy) 
      throw new Error("No sorting strategy set");

    return this.strategy.sort([...array]);
  }
}

/**
 * Bubble Sort Strategy
 */
class BubbleSort {
  sort(array) {
    // Return new sorted array
    const sorted = [...array];
    const sortedLength = sorted.length;

    for (let i = 0; i < sortedLength - 1; i++) {
      for (let j = 0; j < sortedLength - 1 - i; j++) {
        if (sorted[j] > sorted[j + 1]) {
          [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
        }
      }
    }

    return sorted;
  }
}

/**
 * Quick Sort Strategy
 */
class QuickSort {
  sort(array) {
    // Return new sorted array

    if (array.length <= 1) return [...array];

    const pivot = array[0];
    const left = [];
    const right = [];

    for (let i = 1; i < array.length; i++) {
      if (array[i] < pivot) left.push(array[i]);
      else right.push(array[i]);
    }

    return [...this.sort(left), pivot, ...this.sort(right)];
  }
}

/**
 * Merge Sort Strategy
 */
class MergeSort {
  sort(array) {
    if (array.length <= 1) {
      return [...array];
    }

    const middle = Math.floor(array.length / 2);

    const left = array.slice(0, middle);
    const right = array.slice(middle);

    const sortedLeft = this.sort(left);
    const sortedRight = this.sort(right);

    return this.merge(sortedLeft, sortedRight);
  }

  merge(left, right) {
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex] < right[rightIndex]) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }

    while (leftIndex < left.length) {
      result.push(left[leftIndex]);
      leftIndex++;
    }

    while (rightIndex < right.length) {
      result.push(right[rightIndex]);
      rightIndex++;
    }

    return result;
  }
}

// ============================================
// PRICING STRATEGIES
// ============================================

/**
 * Pricing Context
 *
 * Calculates prices using a strategy.
 */
class PricingContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  calculateTotal(items) {
    return this.strategy.calculate(items);
  }
}

/**
 * Regular Pricing (no discount)
 */
class RegularPricing {
  calculate(items) {
    return items.reduce((sum, { price }) => sum + price, 0);
  }
}

/**
 * Percentage Discount
 */
class PercentageDiscount {
  constructor(percentage) {
    this.percentage = percentage;
  }

  calculate(items) {
    // total * (1 - percentage/100)
    return items.reduce((sum, { price }) => sum + price, 0) * (1 - this.percentage / 100);
  }
}

/**
 * Fixed Discount
 */
class FixedDiscount {
  constructor(amount) {
    this.amount = amount;
  }

  calculate(items) {
    // Don't go below 0
    const total = items.reduce((sum, { price }) => sum + price, 0);

    return Math.max(0, total - this.amount);
  }
}

/**
 * Buy One Get One Free
 */
class BuyOneGetOneFree {
  calculate(items) {
    // Sort by price desc, charge only every other item
    return [...items]
      .sort((a, b) => b.price - a.price)
      .reduce((total, { price }, index) => {
        return index % 2 === 0 ? total + price : total;
      }, 0);
  }
}

/**
 * Tiered Discount
 *
 * Different discount based on total.
 */
class TieredDiscount {
  constructor(tiers) {
    // tiers = [{ threshold: 100, discount: 10 }, { threshold: 200, discount: 20 }]
    this.tiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
  }

  calculate(items) {
    const subtotal = items.reduce((sum, { price }) => sum + price, 0);

    for (let i = this.tiers.length - 1; i >= 0; i--) {
      if (subtotal >= this.tiers[i].threshold) {
        return subtotal * (1 - this.tiers[i].discount / 100);
      }
    }

    return subtotal;
  }
}

// ============================================
// VALIDATION STRATEGIES
// ============================================

/**
 * Validation Context
 */
class ValidationContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  validate(data) {
    return this.strategy.validate(data);
  }
}

/**
 * Strict Validation
 *
 * Requires all three fields to be present and valid:
 * - name: must be a non-empty string
 * - email: must be a non-empty string (no regex validation required)
 * - age: must be a number (any number is valid, no range check required)
 */
class StrictValidation {
  validate(data) {
    // Return { valid: boolean, errors: string[] }
    // Example: { valid: false, errors: ["Name is required", "Email is required"] }
    const { name, email, age } = data;
    const errors = [];

    if (!name || typeof name !== "string" || name.trim() === "") {
      errors.push("Name is required");
    }

    if (!email || typeof email !== "string" || email.trim() === "") {
      errors.push("Email is required");
    }

    if (age === undefined || age === null || typeof age !== "number" || isNaN(age)) {
      errors.push("Age is required and must be a number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Lenient Validation
 *
 * Accepts any data, including empty objects.
 * No validation rules - always passes.
 */
class LenientValidation {
  validate(data) {
    // This strategy has no validation rules
    return {
      valid: true,
      errors: [],
    };
  }
}

// ============================================
// STRATEGY REGISTRY
// ============================================

/**
 * Strategy Registry
 *
 * Register and retrieve strategies by name.
 */
class StrategyRegistry {
  constructor() {
    this.strategies = new Map();
  }

  register(name, strategy) {
    this.strategies.set(name, strategy);
  }

  get(name) {
    return this.strategies.get(name) || null;
  }

  has(name) {
    return this.strategies.has(name);
  }
}

module.exports = {
  // Sorting
  SortContext,
  BubbleSort,
  QuickSort,
  MergeSort,
  // Pricing
  PricingContext,
  RegularPricing,
  PercentageDiscount,
  FixedDiscount,
  BuyOneGetOneFree,
  TieredDiscount,
  // Validation
  ValidationContext,
  StrictValidation,
  LenientValidation,
  // Registry
  StrategyRegistry,
};
