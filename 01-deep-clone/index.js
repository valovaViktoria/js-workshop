/**
 * Deep Clone Implementation
 *
 * Create a deep copy of any JavaScript value, including nested objects,
 * arrays, and special types like Date, RegExp, Map, and Set.
 *
 * @param {*} value - The value to clone
 * @param {WeakMap} [visited] - WeakMap to track circular references (used internally)
 * @returns {*} A deep clone of the input value
 */
function deepClone(value, visited = new WeakMap()) {
  // Step 1: Handle primitives (return as-is)
  // Primitives: null, undefined, number, string, boolean, symbol, bigint
  if (value == null || typeof value !== 'object') 
    return value;

  // Step 2: Check for circular references using the visited WeakMap
  // If we've seen this object before, return the cached clone
  if (visited.has(value)) 
    return visited.get(value);

  // Step 3: Handle Date objects
  // Create a new Date with the same time value
  if (value instanceof Date) {
    const clonedDate = new Date(value.getTime());
    visited.set(value, clonedDate);

    return clonedDate;
  }

  // Step 4: Handle RegExp objects
  // Create a new RegExp with the same source and flags
  if (value instanceof RegExp) {
    const clonedRegExp = new RegExp(value.source, value.flags);
    visited.set(value, clonedRegExp);

    return clonedRegExp;
  }

  // Step 5: Handle Map objects
  // Create a new Map and deep clone each key-value pair
  if (value instanceof Map) {
    const clonedMap = new Map();
    visited.set(value, clonedMap);

    for (const [key, val] of value) {
      clonedMap.set(deepClone(key, visited), deepClone(val, visited));
    }

    return clonedMap;
  }

  // Step 6: Handle Set objects
  // Create a new Set and deep clone each value
  if (value instanceof Set) {
    const clonedSet = new Set();
    visited.set(value, clonedSet);

    for (const item of value) {
      clonedSet.add(deepClone(item, visited));
    }

    return clonedSet;
  }

  // Step 7: Handle Arrays
  // Create a new array and deep clone each element
  if (Array.isArray(value)) {
    const clonedArray = [];
    visited.set(value, clonedArray);

    for (let i = 0; i < value.length; i++) {
      clonedArray[i] = deepClone(value[i], visited);
    }

    return clonedArray;
  }

  // Step 8: Handle plain Objects
  // Create a new object and deep clone each property
  const clonedObject = {};
  visited.set(value, clonedObject);

  for (const key in value) {
    clonedObject[key] = deepClone(value[key], visited);
  }

  return clonedObject;
}

module.exports = { deepClone };
