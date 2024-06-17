/**
 * Keeps track of the history of a piece of state. You can push new states onto
 * the stack, undo to previous states, and redo to future states.
 */
export class UndoStack<T> {
  private stack: T[] = [];
  private index: number | undefined = undefined;

  constructor(private maxLength: number) {}

  /**
   * Push a new state onto the stack. If {@link undo} has been called, the
   * future states will be dropped and the new state will be pushed onto the
   * stack.
   *
   * @param item The new state to push onto the stack
   */
  push(item: T) {
    if (this.index != null) {
      this.stack.splice(
        this.index + 1,
        this.stack.length - this.index - 1,
        item,
      );
    } else {
      this.stack.push(item);
    }

    if (this.stack.length > this.maxLength) {
      this.stack.shift();
    }

    this.index = this.stack.length - 1;
  }

  /**
   * Undo to the previous state.
   *
   * @returns The previous state, or `undefined` if there are no previous states
   */
  undo(): T | undefined {
    if (this.index != null && this.index > 0) {
      this.index--;
      return this.stack[this.index];
    }

    return undefined;
  }

  /**
   * Redo to the next state.
   *
   * @returns The next state, or `undefined` if there are no future states
   */
  redo(): T | undefined {
    if (this.index != null && this.index < this.stack.length - 1) {
      this.index++;
      return this.stack[this.index];
    }

    return undefined;
  }
}
