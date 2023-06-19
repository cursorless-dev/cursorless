import * as assert from "assert";
import { openNewEditor } from "@cursorless/vscode-common";
import VscodeTextLineImpl from "./VscodeTextLineImpl";

/**
 * Each test is of the form:
 *
 * `[text, firstNonWhitespaceCharacterIndex, lastNonWhitespaceCharacterIndex]`
 */
const whiteSpaceTests: [string, number, number][] = [
  ["   ", 3, 0],
  ["foo", 0, 3],
  [" foo ", 1, 4],
];

suite("TextLine", function () {
  this.timeout("100s");
  this.retries(5);
  whiteSpaceTests.forEach(
    ([
      text,
      firstNonWhitespaceCharacterIndex,
      lastNonWhitespaceCharacterIndex,
    ]) => {
      test(`whitespace '${text}'`, async () => {
        const editor = await openNewEditor(text);
        const line = new VscodeTextLineImpl(editor.document.lineAt(0));

        assert.equal(
          line.firstNonWhitespaceCharacterIndex,
          firstNonWhitespaceCharacterIndex,
        );
        assert.equal(
          line.lastNonWhitespaceCharacterIndex,
          lastNonWhitespaceCharacterIndex,
        );
      });
    },
  );
});
