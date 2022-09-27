import * as assert from "assert";
import { SUBWORD_MATCHER } from "../../processTargets/modifiers/subToken";

import { subtokenFixture } from "./fixtures/subtoken.fixture";

suite("subtoken regex matcher", () => {
  subtokenFixture.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(input.match(SUBWORD_MATCHER), expectedOutput);
    });
  });
});
