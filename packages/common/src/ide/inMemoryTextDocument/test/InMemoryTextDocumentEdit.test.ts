import * as assert from "node:assert";
import { Range } from "../../..";
import { createTestDocument } from "./createTestDocument";

const text = "hello\nworld";

suite("InMemoryTextDocument edit", () => {
  test("change", () => {
    const document = createTestDocument(text);
    document.edit([{ range: new Range(0, 0, 0, 5), text: "goodbye" }]);

    assert.equal(document.text, "goodbye\nworld");
  });

  test("remove", () => {
    const document = createTestDocument(text);
    document.edit([{ range: new Range(0, 0, 1, 0), text: "" }]);

    assert.equal(document.text, "world");
  });

  test("insert", () => {
    const document = createTestDocument(text);
    document.edit([{ range: new Range(0, 5, 0, 5), text: "!" }]);

    assert.equal(document.text, "hello!\nworld");
  });

  test("multiple inserts", () => {
    const document = createTestDocument("");

    const changes = document.edit([
      { range: new Range(0, 0, 0, 0), text: "aaa" },
      { range: new Range(0, 0, 0, 0), text: "bbb" },
      { range: new Range(0, 0, 0, 0), text: "ccc" },
    ]);

    assert.equal(document.text, "aaabbbccc");

    assert.equal(changes[0].range.toString(), "0:0-0:0");
    assert.equal(changes[0].text, "ccc");
    assert.equal(changes[1].range.toString(), "0:0-0:0");
    assert.equal(changes[1].text, "bbb");
    assert.equal(changes[2].range.toString(), "0:0-0:0");
    assert.equal(changes[2].text, "aaa");
  });

  test("multiple", () => {
    const document = createTestDocument(text);
    document.edit([
      { range: new Range(0, 5, 0, 5), text: "!" },
      { range: new Range(1, 0, 1, 1), text: "" },
      { range: new Range(0, 0, 0, 5), text: "goodbye" },
    ]);

    assert.equal(document.text, "goodbye!\norld");
  });

  test("remove overlapping", () => {
    const document = createTestDocument(text);
    const changes = document.edit([
      { range: new Range(0, 0, 0, 4), text: "" },
      { range: new Range(0, 1, 1, 1), text: "" },
    ]);

    assert.equal(document.text, "orld");
    assert.equal(changes.length, 1);
    assert.equal(changes[0].range.toString(), "0:0-1:1");
  });

  test("change overlapping", () => {
    const document = createTestDocument(text);

    try {
      document.edit([
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
