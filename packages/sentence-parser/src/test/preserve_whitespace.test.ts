import assert from "node:assert";
import * as parser from "..";

const options = { preserveWhitespace: true };

suite("sentence-parser: Preserve whitespace", function () {
  suite("Basic", function () {
    const entry =
      " This is\ta  sentence   with  funny whitespace.  And this  is \tanother.\tHere  is   a third. ";
    const sentences = parser.getSentences(entry, options);

    test("should get 3 sentences", function () {
      assert.equal(sentences.length, 3);
    });

    test("funny whitespace is preserved in the sentences", function () {
      assert.equal(sentences.join(""), entry);
      assert.equal(
        sentences[0],
        " This is\ta  sentence   with  funny whitespace.  ",
      );
      assert.equal(sentences[1], "And this  is \tanother.\t");
      assert.equal(sentences[2], "Here  is   a third. ");
    });
  });

  suite("No effect if newline_boundaries are specified", function () {
    const entry = " This is\ta  sentence   with  funny whitespace. ";
    const sentences = parser.getSentences(
      entry,
      Object.assign({ newlineBoundaries: true }, options),
    );

    test("should get 1 sentences", function () {
      assert.equal(sentences.length, 1);
    });

    test("funny whitespace is not preserved when newline_boundaries is specified", function () {
      assert.equal(sentences[0], "This is a sentence with funny whitespace.");
    });
  });

  suite("It should properly join single-word list sentences", function () {
    const entry =
      "iv. determining that the advertisement in the lift study is a candidate ad for the user, computing whether to include the user in a test group or a control group for the lift study ([0032]), v. based on the computation indicating that the user is in the control group, holding out the advertisement from completing the ad selection process for the user ([0032]), and vi. based on the computation indicating that the user is in the test group, allowing the advertisement to continue through the ad selection process such that the user receives either the advertisement in the lift study or another advertisement ([0032]); and ";
    const sentences = parser.getSentences(entry, options);

    test("should get the correct sentences", function () {
      assert.deepEqual(sentences, [
        "iv. determining that the advertisement in the lift study is a candidate ad for the user, computing whether to include the user in a test group or a control group for the lift study ([0032]), v. based on the computation indicating that the user is in the control group, holding out the advertisement from completing the ad selection process for the user ([0032]), and vi. ",
        "based on the computation indicating that the user is in the test group, allowing the advertisement to continue through the ad selection process such that the user receives either the advertisement in the lift study or another advertisement ([0032]); and ",
      ]);
    });
  });
});
