import * as assert from "assert";
import { openNewEditor } from "@cursorless/vscode-common";
import VscodeTextLine from "./VscodeTextLine";

/**
 * Each test is of the form:
 *
 * `[text, firstNonWhitespaceCharacterIndex, lastNonWhitespaceCharacterIndex]`
 */
const whiteSpaceTests: [string, number | undefined, number | undefined][] = [
  ["   ", undefined, undefined],
  ["foo", 0, 3],
  [" foo ", 1, 4],
];

suite("TextLine", function () {
  this.timeout("100s");
  this.retries(5);
  whiteSpaceTests.forEach(([text, trimmedStart, trimmedEnd]) => {
    test(`whitespace '${text}'`, async () => {
      const editor = await openNewEditor(text);
      const line = new VscodeTextLine(editor.document.lineAt(0));

      assert.equal(line.rangeTrimmed?.start?.character, trimmedStart);
      assert.equal(line.rangeTrimmed?.end?.character, trimmedEnd);
    });
  });
});
