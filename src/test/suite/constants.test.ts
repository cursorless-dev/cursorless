import * as assert from "assert";

import { SUBWORD_MATCHER } from "../../core/constants";
import { subwordFixture } from "./fixtures/constants.fixture";

suite("subword regex matcher", () => {
  subwordFixture.forEach(({ input, expectedOutput }, index) => {
    test(input, () => {
      assert.deepStrictEqual(input.match(SUBWORD_MATCHER), expectedOutput);
    });
  });
});
