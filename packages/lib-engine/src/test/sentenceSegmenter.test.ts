import * as assert from "assert";
import { SentenceSegmenter } from "../processTargets/modifiers/scopeHandlers/SentenceScopeHandler/SentenceSegmenter";
import { sentenceSegmenterFixture } from "./fixtures/sentenceSegmeter.fixture";

suite("Sentence segmenter", () => {
  sentenceSegmenterFixture.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(
        Array.from(new SentenceSegmenter().segment(input)).map(
          ({ text }) => text,
        ),
        expectedOutput,
      );
    });
  });
});
