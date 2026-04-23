import * as assert from "node:assert/strict";
import * as parser from "..";

suite("sentence-parser: Save newlines", () => {
  suite("Basic", () => {
    const entry =
      "First sentence... Another list: \n - green \n - blue \n - red";
    const sentences = parser.getSentences(entry);

    test("second sentence should have newlines", () => {
      assert.equal(sentences[1], "Another list: \n - green \n - blue \n - red");
    });
  });

  suite("Sentence without lists", () => {
    const entry =
      "First sentence... Another sentence.\nThis is a new paragraph.";
    const sentences = parser.getSentences(entry);

    test("second sentence should have newlines", () => {
      assert.equal(sentences.length, 3);
    });
  });

  suite("With option to use newlines as sentence boundaries", () => {
    const entry =
      "First sentence... Another list: \n - green \n - blue \n - red";
    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("second sentence should have newlines", () => {
      assert.equal(sentences.length, 5);
    });
  });

  suite("Multiline strings", () => {
    const entry =
      // oxlint-disable-next-line no-multi-str
      "How now brown cow.\
        \
        Peter Piper Picked a peck of pickled peppers. A peck of pickled peppers peter piper picked.";

    const sentences = parser.getSentences(entry);

    test("Should have 3 sentences ending in periods", () => {
      assert.equal(sentences[0], "How now brown cow.");
      assert.equal(
        sentences[1],
        "Peter Piper Picked a peck of pickled peppers.",
      );
    });
  });

  suite("Template multiline strings", () => {
    const entry = `How now brown cow.

        Peter Piper Picked a peck of pickled peppers. A peck of pickled peppers peter piper picked.`;

    const sentences = parser.getSentences(entry, { newlineBoundaries: true });

    test("Should have 3 sentences ending in periods", () => {
      assert.equal(sentences[0], "How now brown cow.");
      assert.equal(
        sentences[1],
        "Peter Piper Picked a peck of pickled peppers.",
      );
    });
  });
});
