/**
 * Command Pattern Implementation
 */

/**
 * Command Manager
 *
 * Manages command execution with undo/redo support.
 */
class CommandManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Execute a command
   * @param {Object} command - Command with execute() method
   */
  execute(command) {
    if (!command || typeof command.execute !== "function") 
      throw new Error("Command must have execute() method");    

    // Step 1: Call command.execute()
    command.execute();
   
    // Step 2: Push to undo stack
    this.undoStack.push(command);

    // Step 3: Clear redo stack (new action invalidates redo history)
    this.redoStack.length = 0;
  }

  /**
   * Undo the last command
   * @returns {boolean} Whether undo was performed
   */
  undo() {
    // Step 1: Check if undo stack is empty
    if(!this.undoStack.length)
      return false;

    // Step 2: Pop command from undo stack
    const command = this.undoStack.pop();

    // Step 3: Call command.undo()
    command.undo()

    // Step 4: Push to redo stack
    this.redoStack.push(command);

    // Step 5: Return true
    return true;
  }

  /**
   * Redo the last undone command
   * @returns {boolean} Whether redo was performed
   */
  redo() {
    // Step 1: Check if redo stack is empty
    if(!this.redoStack.length)
      return false;

    // Step 2: Pop command from redo stack
    const command = this.redoStack.pop();

    // Step 3: Call command.execute()
    command.execute()

    // Step 4: Push to undo stack
    this.undoStack.push(command);

    // Step 5: Return true
    return true;
  }

  /**
   * Check if undo is available
   * @returns {boolean}
   */
  canUndo() {
    return !!this.undoStack.length;
  }

  /**
   * Check if redo is available
   * @returns {boolean}
   */
  canRedo() {
    return !!this.redoStack.length;
  }

  /**
   * Get command history (executed commands)
   * @returns {Object[]}
   */
  get history() {
    return [...this.undoStack];
  }

  /**
   * Clear all history
   */
  clear() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}

/**
 * Add Command
 */
class AddCommand {
  constructor(calculator, value) {
    this.calculator = calculator;
    this.value = value;
    this.description = `Add ${value}`;
  }

  execute() {
    this.calculator.value += this.value;
  }

  undo() {
   this.calculator.value -= this.value;
  }
}

/**
 * Subtract Command
 */
class SubtractCommand {
  constructor(calculator, value) {
    this.calculator = calculator;
    this.value = value;
    this.description = `Subtract ${value}`;
  }

  execute() {
    this.calculator.value -= this.value;
  }

  undo() {
    this.calculator.value += this.value;
  }
}

/**
 * Multiply Command
 */
class MultiplyCommand {
  constructor(calculator, value) {
    this.calculator = calculator;
    this.value = value;
    this.previousValue = null;    
    this.description = `Multiply by ${value}`;
  }

  execute() {
    // Save previous value for undo
    this.previousValue = this.calculator.value;
    this.calculator.value *= this.value;
  }

  undo() {
    this.calculator.value = this.previousValue;
  }
}

/**
 * Divide Command
 */
class DivideCommand {
  constructor(calculator, value) {
     if (value === 0) 
      throw new Error('Division by zero is not allowed');
    
    this.calculator = calculator;
    this.value = value;
    this.previousValue = null;    
    this.description = `Divide by ${value}`;
  }

  execute() {
    // Save previous value for undo
    this.previousValue = this.calculator.value;
    this.calculator.value /= this.value;
  }

  undo() {
    this.calculator.value = this.previousValue;
  }
}

/**
 * Macro Command (Composite)
 *
 * Groups multiple commands into one.
 */
class MacroCommand {
  constructor(commands = []) {
    this.commands = commands;
    this.description = "Macro";
  }

  /**
   * Add a command to the macro
   * @param {Object} command
   */
  add(command) {
    this.commands.push(command);
  }

  execute() {
    this.commands.forEach(command => command.execute());
  }

  undo() {
    [...this.commands].reverse().forEach(command => command.undo());
  }
}

/**
 * Set Value Command
 *
 * Sets calculator to specific value (useful for testing).
 */
class SetValueCommand {
  constructor(calculator, value) {
    this.calculator = calculator;
    this.value = value;
    this.previousValue = null; 
    this.description = `Set to ${value}`;
  }

  execute() {
    this.previousValue = this.calculator.value;
    this.calculator.value = this.value;
  }

  undo() {
    this.calculator.value = this.previousValue;
  }
}

module.exports = {
  CommandManager,
  AddCommand,
  SubtractCommand,
  MultiplyCommand,
  DivideCommand,
  MacroCommand,
  SetValueCommand,
};
