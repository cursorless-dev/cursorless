import * as assert from "node:assert";
import { URI } from "vscode-uri";
import { Range } from "../..";
import { InMemoryTextDocument } from "./InMemoryTextDocument";
import { performEdits } from "./performEdits";

const uri = URI.parse("cursorless-dummy://dummy/untitled");
const languageId = "plaintext";

const text = "hello\nworld";

suite("performEdits", () => {
  test("change", async () => {
    const document = new InMemoryTextDocument(uri, languageId, text);
    await performEdits(document, [
      { range: new Range(0, 0, 0, 5), text: "goodbye" },
    ]);

    assert.equal(document.text, "goodbye\nworld");
  });

  test("remove", async () => {
    const document = new InMemoryTextDocument(uri, languageId, text);
    await performEdits(document, [{ range: new Range(0, 0, 1, 0), text: "" }]);

    assert.equal(document.text, "world");
  });

  test("insert", async () => {
    const document = new InMemoryTextDocument(uri, languageId, text);
    await performEdits(document, [{ range: new Range(0, 5, 0, 5), text: "!" }]);

    assert.equal(document.text, "hello!\nworld");
  });

  test("multiple", async () => {
    const document = new InMemoryTextDocument(uri, languageId, text);
    await performEdits(document, [
      { range: new Range(0, 5, 0, 5), text: "!" },
      { range: new Range(1, 0, 1, 1), text: "" },
      { range: new Range(0, 0, 0, 5), text: "goodbye" },
    ]);

    assert.equal(document.text, "goodbye!\norld");
  });

  test("remove overlapping", async () => {
    const document = new InMemoryTextDocument(uri, languageId, text);
    const changes = await performEdits(document, [
      { range: new Range(0, 0, 0, 4), text: "" },
      { range: new Range(0, 1, 1, 1), text: "" },
    ]);

    assert.equal(document.text, "orld");
    assert.equal(changes.length, 1);
    assert.equal(changes[0].range.toString(), "0:0-1:1");
  });

  test("change overlapping", async () => {
    const document = new InMemoryTextDocument(uri, languageId, text);

    try {
      await performEdits(document, [
        { range: new Range(0, 0, 0, 4), text: " " },
        { range: new Range(0, 1, 1, 1), text: "" },
      ]);
      assert.fail("Expected an error");
    } catch (error) {
      assert.equal(
        (error as Error).message,
        "Overlapping ranges are not allowed!",
      );
    }
  });
});
