import assert from "node:assert/strict";
import { getSentences } from "..";

suite("sentence-parser: Empty", () => {
  suite("string", () => {
    let entry = "";
    let sentences = getSentences(entry);

    test("should not get a sentence", () => {
      assert.equal(sentences.length, 0);
    });

    entry = "            \n\n                 ";
    sentences = getSentences(entry);

    test("should not get a sentence from whitespace", () => {
      assert.equal(sentences.length, 0);
    });
  });

  suite("symbols only", () => {
    const entry = "^&%(*&";
    const sentences = getSentences(entry);

    test("should not single entry", () => {
      assert.equal(sentences.length, 1);
    });
  });
});
