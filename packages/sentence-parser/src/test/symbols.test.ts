import assert from "node:assert";
import * as parser from "..";

suite("sentence-parser: Sentences with symbols", function () {
  suite("It should skip numbers", function () {
    const entry = "10 times 10 = 10.00^2. 13.000 14.50 and 14,000,000.50";
    const sentences = parser.sentences(entry);

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("It should skip urls and emails", function () {
    const entry =
      "Search on http://google.com. Then send me an email: fabien@somedomain.com or fabien@anotherdomain.cc";
    const sentences = parser.sentences(entry);

    test("should get 2 sentences", function () {
      assert.equal(sentences.length, 2);
    });
  });

  suite("It should skip phone numbers", function () {
    const entry = "Call +44.3847838 for whatever.";
    const sentences = parser.sentences(entry);

    test("should get 1 sentence", function () {
      assert.equal(sentences.length, 1);
    });
  });

  suite("It should skip money with currency indication", function () {
    const entry =
      "I paid €12.50 for that CD. Twelve dollars and fifty cent ($12.50). Ten pounds - £10.00 it is fine.";
    const sentences = parser.sentences(entry);

    test("should get 1 sentence", function () {
      assert.equal(sentences.length, 3);
    });
  });

  suite("Newlines/paragraph must be enabled to end sentences", function () {
    const entry =
      "The humble bundle sale\r\nDate: Monday-Fri starting 2015-01-01";
    const sentences = parser.sentences(entry);

    test("should get 1 sentences", function () {
      assert.equal(sentences.length, 1);
    });
  });

  suite("Newlines/paragraph enabled ends sentences", function () {
    const entry =
      "The humble bundle sale\r\nDate: Monday-Fri starting 2015-01-01\nSales starting at ¤2,50";
    const sentences = parser.sentences(entry, { newlineBoundaries: true });

    test("should get 3 sentences", function () {
      assert.equal(sentences.length, 3);
    });
  });
});
