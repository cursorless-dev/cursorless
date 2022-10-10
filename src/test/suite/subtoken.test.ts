import * as assert from "assert";
import { subWordSplitter } from "../../processTargets/modifiers/subToken";
import { subtokenFixture } from "./fixtures/subtoken.fixture";

suite("subtoken regex matcher", () => {
  subtokenFixture.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(
        subWordSplitter(input).map(({ text }) => text),
        expectedOutput
      );
    });
  });
});
