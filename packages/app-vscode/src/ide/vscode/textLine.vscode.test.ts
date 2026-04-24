import * as assert from "node:assert/strict";
import { getReusableEditor } from "@cursorless/lib-vscode-common";
import { VscodeTextLine } from "./VscodeTextLine";

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
  for (const [text, trimmedStart, trimmedEnd] of whiteSpaceTests) {
    test(`whitespace '${text}'`, async () => {
      const editor = await getReusableEditor(text);
      const line = new VscodeTextLine(editor.document.lineAt(0));

      assert.equal(line.rangeTrimmed?.start?.character, trimmedStart);
      assert.equal(line.rangeTrimmed?.end?.character, trimmedEnd);
    });
  }
});
