import * as assert from "node:assert/strict";
import * as parser from "..";

suite("sentence-parser: Lists", () => {
  suite("It should skip list enumeration", () => {
    const entry = "1. The item\n2. Another item";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 2 sentences", () => {
      assert.equal(sentences.length, 2);
    });
  });

  suite("It should skip alternative list enumeration", () => {
    const entry = "a. The item\nab. Another item\n(1.) Third item";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 3 sentences", () => {
      assert.equal(sentences.length, 3);
    });
  });

  suite("It should keep empty list enumeration", () => {
    const entry = "a. The item\nzz.\nab.\ncd. Hello";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 4 sentences", () => {
      assert.equal(sentences.length, 4);
    });
  });
});
