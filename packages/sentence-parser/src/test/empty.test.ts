import assert from "node:assert";
import * as parser from "..";

suite("sentence-parser: Empty", function () {
  suite("string", function () {
    let entry = "";
    let sentences = parser.getSentences(entry);

    test("should not get a sentence", function () {
      assert.equal(sentences.length, 0);
    });

    entry = "            \n\n                 ";
    sentences = parser.getSentences(entry);

    test("should not get a sentence from whitespace", function () {
      assert.equal(sentences.length, 0);
    });
  });

  suite("symbols only", function () {
    const entry = "^&%(*&";
    const sentences = parser.getSentences(entry);

    test("should not single entry", function () {
      assert.equal(sentences.length, 1);
    });
  });
});
