import assert from "node:assert/strict";
import { getTutorialsForContext } from "./tutorials";

suite("tutorials", () => {
  test("filters tutorials by context", () => {
    assert.deepEqual(
      getTutorialsForContext("documentation").map(({ id }) => id),
      ["introduction", "basic-coding"],
    );
    assert.deepEqual(
      getTutorialsForContext("interactive").map(({ id }) => id),
      ["introduction", "basic-coding", "visualization"],
    );
  });

  test("assigns positions from tutorial order", () => {
    assert.deepEqual(
      getTutorialsForContext("interactive").map(({ position }) => position),
      [1, 2, 3],
    );
    assert.deepEqual(
      getTutorialsForContext("documentation").map(({ position }) => position),
      [1, 2],
    );
  });

  test("resolves steps for context", () => {
    const documentationTutorial = getTutorialsForContext("documentation")[0];
    const interactiveTutorial = getTutorialsForContext("interactive")[0];

    assert.equal(
      documentationTutorial.steps[1],
      "Well done! 🙌 You just used the code word for 'c', {grapheme:c}, to refer to the word with a gray hat over the 'c'.\nWhen a hat is not gray, we say its color: say {command:takeBlueSun.yml}",
    );
    assert.equal(
      documentationTutorial.steps.at(-1),
      "And that wraps up unit 1 of the Cursorless tutorial! Next time, we'll write some code 🙌.",
    );
    assert.equal(
      interactiveTutorial.steps.at(-1),
      "And that wraps up unit 1 of the Cursorless tutorial! Next time, we'll write some code 🙌.\nFeel free to keep playing with this document, then say {special:next} to continue.",
    );
  });
});
