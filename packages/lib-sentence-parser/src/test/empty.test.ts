import * as assert from "node:assert/strict";
import * as parser from "..";

suite("sentence-parser: Empty", () => {
  suite("string", () => {
    let entry = "";
    let sentences = parser.getSentences(entry);

    test("should not get a sentence", () => {
      assert.equal(sentences.length, 0);
    });

    entry = "            \n\n                 ";
    sentences = parser.getSentences(entry);

    test("should not get a sentence from whitespace", () => {
      assert.equal(sentences.length, 0);
    });
  });

  suite("symbols only", () => {
    const entry = "^&%(*&";
    const sentences = parser.getSentences(entry);

    test("should not single entry", () => {
      assert.equal(sentences.length, 1);
    });
  });
});
