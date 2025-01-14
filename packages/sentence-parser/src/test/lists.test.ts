import assert from "node:assert";
import * as parser from "..";

suite("sentence-parser: Lists", function () {
  suite("It should skip list enumeration", function () {
    const entry = "1. The item\n2. Another item";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("It should skip alternative list enumeration", function () {
    const entry = "a. The item\nab. Another item\n(1.) Third item";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 3 sentences", function () {
      assert.equal(sentences.length, 3);
    });
  });

  suite("It should keep empty list enumeration", function () {
    const entry = "a. The item\nzz.\nab.\ncd. Hello";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("should get 4 sentences", function () {
      assert.equal(sentences.length, 4);
    });
  });
});
