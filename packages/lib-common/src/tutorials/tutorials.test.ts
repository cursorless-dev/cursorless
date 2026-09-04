import assert from "node:assert/strict";
import { getTutorialsForContext } from "./tutorials";

suite("tutorials", () => {
  test("filters tutorials by context", () => {
    assert.deepEqual(
      getTutorialsForContext("documentation").map(({ id }) => id),
      ["tutorial-1-introduction", "tutorial-2-basic-coding"],
    );
    assert.deepEqual(
      getTutorialsForContext("interactive").map(({ id }) => id),
      [
        "tutorial-1-introduction",
        "tutorial-2-basic-coding",
        "tutorial-3-visualization",
      ],
    );
  });
});
