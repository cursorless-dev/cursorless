import assert from "node:assert";
import { UndoStack } from "./UndoStack";

suite("UndoStack", () => {
  test("should undo and redo", () => {
    const undoStack = new UndoStack<string>(3);
    undoStack.push("a");
    undoStack.push("b");
    undoStack.push("c");
    assert.strictEqual(undoStack.undo(), "b");
    assert.strictEqual(undoStack.undo(), "a");
    assert.strictEqual(undoStack.undo(), undefined);
    assert.strictEqual(undoStack.redo(), "b");
    assert.strictEqual(undoStack.redo(), "c");
    assert.strictEqual(undoStack.redo(), undefined);
  });

  test("should clobber stack if push after undo", () => {
    const undoStack = new UndoStack<string>(3);
    undoStack.push("a");
    undoStack.push("b");
    undoStack.push("c");
    assert.strictEqual(undoStack.undo(), "b");
    undoStack.push("d");
    assert.strictEqual(undoStack.undo(), "b");
    assert.strictEqual(undoStack.redo(), "d");
    assert.strictEqual(undoStack.redo(), undefined);
  });

  test("should truncate history if max lenght exceeded", () => {
    const undoStack = new UndoStack<string>(3);
    undoStack.push("a");
    undoStack.push("b");
    undoStack.push("c");
    undoStack.push("d");
    assert.strictEqual(undoStack.undo(), "c");
    assert.strictEqual(undoStack.undo(), "b");
    assert.strictEqual(undoStack.undo(), undefined);
  });

  test("should handle empty undo and redo", () => {
    const undoStack = new UndoStack<string>(3);
    assert.strictEqual(undoStack.undo(), undefined);
    assert.strictEqual(undoStack.redo(), undefined);
  });

  test("should handle redo at end of stack", () => {
    const undoStack = new UndoStack<string>(3);
    undoStack.push("a");
    assert.strictEqual(undoStack.redo(), undefined);
  });
});
