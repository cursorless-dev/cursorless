import * as assert from "assert";

import { inferFullTargets } from "../../inferFullTargets";
import fixture from "./fixtures/inferFullTargets.fixture";

suite("inferFullTargets", () => {
  fixture.forEach(({ input, expectedOutput }, index) => {
    test(`inferFullTargets ${index}`, () => {
      assert.deepStrictEqual(
        inferFullTargets(
          input.context,
          input.partialTargets,
          input.actionPreferences
        ),
        expectedOutput
      );
    });
  });
});
