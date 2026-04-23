import * as assert from "node:assert/strict";
import * as parser from "..";

suite("sentence-parser: Single sentences", () => {
  suite("Basic", () => {
    const entry = "First sentence.";
    const sentences = parser.getSentences(entry);

    test("should get one sentence", () => {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Skip ellipsis", () => {
    const entry = "First sentence... another sentence";
    const sentences = parser.getSentences(entry);

    test("should get one sentence", () => {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Difficult single sentence (A)", () => {
    const entry =
      "On Jan. 20, former Sen. Barack Obama became the 44th President of the U.S.";
    const sentences = parser.getSentences(entry);

    test("should get one sentence", () => {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Difficult sentence (B)", () => {
    const entry =
      "It happened around 5:30 p.m. in the 500 block of W. 82nd St. Investigators say Terrence Taylor, 22, and Deontrell Sloan, 17, got into an argument over money during the game.";
    const sentences = parser.getSentences(entry);

    test("should get 1 sentence", () => {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Difficult sentence (C)", () => {
    const entry =
      "GARY Mayor Scott L. King has declared a 'cash crisis' and has asked city department heads to put off all non-essential spending until June.";
    const sentences = parser.getSentences(entry);

    test("should get 1 sentence", () => {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Difficult sentence (D)", () => {
    const entry =
      "HOWELL, Mich. - Blissfield was only nine outs away from ending the longest winning streak";
    const sentences = parser.getSentences(entry);

    test("should get 1 sentence", () => {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Difficult sentence (E)", () => {
    const entry =
      "33 FORT LAUDERDALE U.S. President George W Bush touted free trade as a means of strengthening democracy";
    const sentences = parser.getSentences(entry);

    test("should get 1 sentence", () => {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Difficult sentence (F)", () => {
    const entry =
      "Mike Tyler rides his bike on Del. 1 near Lewes early last month";
    const sentences = parser.getSentences(entry);

    test("should get 1 sentence", () => {
      assert.equal(sentences.length, 1);
    });
  });

  // Questionable behavior, but can only be fixed using ML?
  suite("Dot in middle of word is skipped", () => {
    const entry = "Hello.this is my first sentence.";
    const sentences = parser.getSentences(entry);

    test("should get 1 sentences", () => {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Punctuation is skipped inside brackets", () => {
    const entry =
      "Lorem ipsum, dolor sed amat frequentor minimus with a sentence [example?] that should not (Though sometimes...) be two or more (but one!) sentences.";
    const sentences = parser.getSentences(entry);

    test("should get 1 sentence", () => {
      assert.equal(sentences.length, 1);
    });
  });
});
