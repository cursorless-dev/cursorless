import assert from "node:assert";
import * as parser from "..";

suite("sentence-parser: Save newlines", function () {
  suite("Basic", function () {
    const entry =
      "First sentence... Another list: \n - green \n - blue \n - red";
    const sentences = parser.getSentences(entry);

    test("second sentence should have newlines", function () {
      assert.equal(sentences[1], "Another list: \n - green \n - blue \n - red");
    });
  });

  suite("Sentence without lists", function () {
    const entry =
      "First sentence... Another sentence.\nThis is a new paragraph.";
    const sentences = parser.getSentences(entry);

    test("second sentence should have newlines", function () {
      assert.equal(sentences.length, 3);
    });
  });

  suite("With option to use newlines as sentence boundaries", function () {
    const entry =
      "First sentence... Another list: \n - green \n - blue \n - red";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("second sentence should have newlines", function () {
      assert.equal(sentences.length, 5);
    });
  });

  suite("Multiline strings", function () {
    const entry =
      "How now brown cow.\
        \
        Peter Piper Picked a peck of pickled peppers. A peck of pickled peppers peter piper picked.";

    const sentences = parser.getSentences(entry);

    test("Should have 3 sentences ending in periods", function () {
      assert.equal(sentences[0], "How now brown cow.");
      assert.equal(
        sentences[1],
        "Peter Piper Picked a peck of pickled peppers.",
      );
    });
  });

  suite("Template multiline strings", function () {
    const entry = `How now brown cow.

        Peter Piper Picked a peck of pickled peppers. A peck of pickled peppers peter piper picked.`;

    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("Should have 3 sentences ending in periods", function () {
      assert.equal(sentences[0], "How now brown cow.");
      assert.equal(
        sentences[1],
        "Peter Piper Picked a peck of pickled peppers.",
      );
    });
  });
});
