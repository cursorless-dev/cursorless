import * as assert from "node:assert/strict";
import { SentenceSegmenter } from "../processTargets/modifiers/scopeHandlers/SentenceScopeHandler/SentenceSegmenter";
import { sentenceSegmenterFixture } from "./fixtures/sentenceSegmeter.fixture";

suite("Sentence segmenter", () => {
  for (const { input, expectedOutput } of sentenceSegmenterFixture) {
    test(input, () => {
      assert.deepEqual(
        Array.from(new SentenceSegmenter().segment(input)).map(
          ({ text }) => text,
        ),
        expectedOutput,
      );
    });
  }
});
