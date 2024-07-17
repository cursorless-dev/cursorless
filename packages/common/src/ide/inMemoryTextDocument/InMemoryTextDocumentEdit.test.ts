import * as assert from "node:assert";
import { Range } from "../..";
import { createDocument } from "./createDocument";

const text = "hello\nworld";

suite("InMemoryTextDocument edit", () => {
  test("change", async () => {
    const document = createDocument(text);
    await document.edit([{ range: new Range(0, 0, 0, 5), text: "goodbye" }]);

    assert.equal(document.text, "goodbye\nworld");
  });

  test("remove", async () => {
    const document = createDocument(text);
    await document.edit([{ range: new Range(0, 0, 1, 0), text: "" }]);

    assert.equal(document.text, "world");
  });

  test("insert", async () => {
    const document = createDocument(text);
    await document.edit([{ range: new Range(0, 5, 0, 5), text: "!" }]);

    assert.equal(document.text, "hello!\nworld");
  });

  test("multiple", async () => {
    const document = createDocument(text);
    await document.edit([
      { range: new Range(0, 5, 0, 5), text: "!" },
      { range: new Range(1, 0, 1, 1), text: "" },
      { range: new Range(0, 0, 0, 5), text: "goodbye" },
    ]);

    assert.equal(document.text, "goodbye!\norld");
  });

  test("remove overlapping", async () => {
    const document = createDocument(text);
    const changes = await document.edit([
      { range: new Range(0, 0, 0, 4), text: "" },
      { range: new Range(0, 1, 1, 1), text: "" },
    ]);

    assert.equal(document.text, "orld");
    assert.equal(changes.length, 1);
    assert.equal(changes[0].range.toString(), "0:0-1:1");
  });

  test("change overlapping", async () => {
    const document = createDocument(text);

    try {
      await document.edit([
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
