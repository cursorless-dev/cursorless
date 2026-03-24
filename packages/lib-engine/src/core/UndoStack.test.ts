import * as assert from "node:assert/strict";
import { UndoStack } from "./UndoStack";

suite("UndoStack", () => {
  test("should undo and redo", () => {
    const undoStack = new UndoStack<string>(3);
    undoStack.push("a");
    undoStack.push("b");
    undoStack.push("c");
    assert.equal(undoStack.undo(), "b");
    assert.equal(undoStack.undo(), "a");
    assert.equal(undoStack.undo(), undefined);
    assert.equal(undoStack.redo(), "b");
    assert.equal(undoStack.redo(), "c");
    assert.equal(undoStack.redo(), undefined);
  });

  test("should clobber stack if push after undo", () => {
    const undoStack = new UndoStack<string>(3);
    undoStack.push("a");
    undoStack.push("b");
    undoStack.push("c");
    assert.equal(undoStack.undo(), "b");
    undoStack.push("d");
    assert.equal(undoStack.undo(), "b");
    assert.equal(undoStack.redo(), "d");
    assert.equal(undoStack.redo(), undefined);
  });

  test("should truncate history if max length exceeded", () => {
    const undoStack = new UndoStack<string>(3);
    undoStack.push("a");
    undoStack.push("b");
    undoStack.push("c");
    undoStack.push("d");
    assert.equal(undoStack.undo(), "c");
    assert.equal(undoStack.undo(), "b");
    assert.equal(undoStack.undo(), undefined);
  });

  test("should handle empty undo and redo", () => {
    const undoStack = new UndoStack<string>(3);
    assert.equal(undoStack.undo(), undefined);
    assert.equal(undoStack.redo(), undefined);
  });

  test("should handle redo at end of stack", () => {
    const undoStack = new UndoStack<string>(3);
    undoStack.push("a");
    assert.equal(undoStack.redo(), undefined);
  });
});
