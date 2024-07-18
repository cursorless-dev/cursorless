import assert from "node:assert";
import * as parser from "..";

suite("sentence-parser: Abbreviations in sentences", function () {
  suite("Skip dotted abbreviations", function () {
    const entry =
      "Lorem ipsum, dolor sed amat frequentor minimus In I.C.T we have multiple challenges! There should only be two sentences.";
    const sentences = parser.getSentences(entry);

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Skip dotted abbreviations (B)", function () {
    const entry =
      "From amat frequentor minimus hello there at 8 a.m. there p.m. should only be two sentences.";
    const sentences = parser.getSentences(entry);

    test("should get 1 sentence", function () {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Skip dotted abbreviations (C)", function () {
    const entry =
      "The school, called Booker T and Stevie Ray's Wrestling and Mixed Mart Arts Academy, will have an open house 2-6 p.m. Saturday.";
    const sentences = parser.getSentences(entry);

    test("should get 1 sentence", function () {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Skip common abbreviations", function () {
    const entry =
      "Fig. 2. displays currency rates i.e. something libsum. Currencies widely available (i.e. euro, dollar, pound), or alternatively (e.g. €, $, etc.)";
    const sentences = parser.getSentences(entry);

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Skip two worded abbreviations", function () {
    const entry =
      "Claims 1–6 and 15–26 are rejected under pre-AIA 35 USC § 103(a) as being unpatentable over Chalana et al. (US 2012/0179503) in view of Oh (US 2013/0013993).";
    const sentences = parser.getSentences(entry);

    test("should get 1 sentence", function () {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Skip two worded abbreviations", function () {
    const entry =
      "Et al. is an abbreviation of the Latin loanphrase et alii, meaning and others. It is similar to etc. (short for et cetera, meaning and the rest), but whereas etc. applies to things, et al. applies to people.";
    const sentences = parser.getSentences(entry);

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Use other languages (accented)", function () {
    const options: parser.SentenceParserOptions = {
      newlineBoundaries: true,
      preserveWhitespace: true,
      abbreviations: ["pré"],
    };

    const entry =
      "Random words pré. other words and things. Different status updates all assigned";
    const sentences = parser.getSentences(entry, options);

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("Use other languages", function () {
    const entry =
      "Trzeba tu coś napisać, np. fragment odnoszący się do pkt. 3 wcześniejszego tekstu.";
    const sentencesEN = parser.getSentences(entry);
    const sentencesPL = parser.getSentences(entry, {
      abbreviations: ["np", "pkt"],
    });

    test("should get 1 sentence", function () {
      assert.equal(sentencesEN.length, 3);
      assert.equal(sentencesPL.length, 1);
    });

    test("should not permanently override abbreviations", function () {
      const sentences = parser.getSentences(entry);
      assert.equal(sentences.length, 3);
    });
  });

  suite("Use other languages (Cyrillic)", function () {
    const options = {
      newlineBoundaries: true,
      preserveWhitespace: true,
      abbreviations: ["табл", "рис"],
    };

    const entry =
      "матрицю SWOT- аналізу (табл. hello). Факторами макросередовища (рис. 5.8.). Things on a new line";
    const sentencesCyrillic = parser.getSentences(entry, options);

    test("should get 3 sentences", function () {
      assert.equal(sentencesCyrillic.length, 3);
    });
  });
});
