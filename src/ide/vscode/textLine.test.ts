import * as assert from "assert";
import { openNewEditor } from "../../libs/vscode-common/testUtil/openNewEditor";
import VscodeTextLineImpl from "./VscodeTextLineImpl";

suite("TextLine", () => {
  test("whitespace line", async () => {
    const editor = await openNewEditor("   ");
    const line = new VscodeTextLineImpl(editor.document.lineAt(0));

    assert.equal(line.firstNonWhitespaceCharacterIndex, 3);
    assert.equal(line.lastNonWhitespaceCharacterIndex, 0);
  });
});
