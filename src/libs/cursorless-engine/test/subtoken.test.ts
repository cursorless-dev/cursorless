import * as assert from "assert";
import WordTokenizer from "../scopeHandlers/WordScopeHandler/WordTokenizer";
import { subtokenFixture } from "./fixtures/subtoken.fixture";
import { unitTestSetup } from "./unitTestSetup";

suite("subtoken regex matcher", () => {
  unitTestSetup();

  subtokenFixture.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(
        new WordTokenizer("anyLang")
          .splitIdentifier(input)
          .map(({ text }) => text),
        expectedOutput,
      );
    });
  });
});
