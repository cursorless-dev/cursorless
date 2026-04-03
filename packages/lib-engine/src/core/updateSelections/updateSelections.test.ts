import * as assert from "node:assert/strict";
import type {
  Disposable,
  TextDocumentChangeEvent,
} from "@cursorless/lib-common";
import {
  FakeIDE,
  InMemoryTextEditor,
  Range,
  Selection,
} from "@cursorless/lib-common";
import { RangeUpdater } from "./RangeUpdater";
import { performEditsAndUpdateSelections } from "./updateSelections";

suite("performEditsAndUpdateSelections", () => {
  test("treats CRLF-normalized replace inserts as replace edits", async () => {
    const ide = new TestIDE();
    const editor = new InMemoryTextEditor({
      ide,
      content: "abc\r\ndef",
    });
    const rangeUpdater = new RangeUpdater(ide);
    const selection = new Selection(0, 3, 0, 3);

    const { updated } = await performEditsAndUpdateSelections({
      rangeUpdater,
      editor,
      edits: [
        {
          range: new Range(0, 3, 0, 3),
          text: "\n",
          isReplace: true,
        },
      ],
      preserveCursorSelections: true,
      selections: { updated: [selection] },
    });

    assert.equal(editor.document.getText(), "abc\r\n\r\ndef");
    assert.equal(updated.length, 1);
    assert.equal(updated[0].anchor.line, 0);
    assert.equal(updated[0].anchor.character, 3);
    assert.equal(updated[0].active.line, 0);
    assert.equal(updated[0].active.character, 3);
  });
});

class TestIDE extends FakeIDE {
  private textDocumentChangeListeners: ((
    event: TextDocumentChangeEvent,
  ) => void)[] = [];

  override onDidChangeTextDocument = (
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable => {
    this.textDocumentChangeListeners.push(listener);

    return {
      dispose: () => {
        this.textDocumentChangeListeners =
          this.textDocumentChangeListeners.filter(
            (candidate) => candidate !== listener,
          );
      },
    };
  };

  override emitDidChangeTextDocument = (event: TextDocumentChangeEvent) => {
    this.textDocumentChangeListeners.forEach((listener) => listener(event));
  };
}
