import * as assert from "assert";
import WordTokenizer from "../../processTargets/modifiers/scopeHandlers/WordTokenizer";
import { subtokenFixture } from "./fixtures/subtoken.fixture";

suite("subtoken regex matcher", () => {
  const wordTokenizer = new WordTokenizer("anyLang");
  subtokenFixture.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(
        wordTokenizer.splitIdentifier(input).map(({ text }) => text),
        expectedOutput
      );
    });
  });
});
