import * as assert from "assert";

import { SUBWORD_MATCHER } from "../../core/constants";
import { subtokenFixture } from "./fixtures/subtoken.fixture";

suite("subtoken regex matcher", () => {
  subtokenFixture.forEach(({ input, expectedOutput }, index) => {
    test(input, () => {
      assert.deepStrictEqual(input.match(SUBWORD_MATCHER), expectedOutput);
    });
  });
});
