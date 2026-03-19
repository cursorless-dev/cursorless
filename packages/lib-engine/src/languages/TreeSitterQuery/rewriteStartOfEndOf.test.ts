import { Range } from "@cursorless/lib-common";
import assert from "assert";
import type { MutableQueryCapture, QueryCapture } from "./QueryCapture";
import {
  createTestQueryCapture,
  rewriteStartOfEndOf,
} from "./rewriteStartOfEndOf";

type NameRange = Pick<MutableQueryCapture, "name" | "range">;

interface TestCase {
  name: string;
  captures: NameRange[];
  expected: NameRange[];
}

const testCases: TestCase[] = [
  {
    name: "should rewrite startOf to start of range",
    captures: [
      { name: "@value.iteration.start.startOf", range: new Range(1, 2, 1, 3) },
      { name: "@collectionKey.startOf", range: new Range(1, 2, 1, 3) },
    ],
    expected: [
      { name: "@value.iteration.start", range: new Range(1, 2, 1, 2) },
      { name: "@collectionKey", range: new Range(1, 2, 1, 2) },
    ],
  },

  {
    name: "should rewrite endOf to start of range",
    captures: [
      { name: "@value.iteration.start.endOf", range: new Range(1, 2, 1, 3) },
      { name: "@collectionKey.endOf", range: new Range(1, 2, 1, 3) },
    ],
    expected: [
      { name: "@value.iteration.start", range: new Range(1, 3, 1, 3) },
      { name: "@collectionKey", range: new Range(1, 3, 1, 3) },
    ],
  },

  {
    name: "should leave other captures alone",
    captures: [
      { name: "@value.iteration.start", range: new Range(1, 2, 1, 3) },
      { name: "@collectionKey", range: new Range(1, 2, 1, 3) },
    ],
    expected: [
      { name: "@value.iteration.start", range: new Range(1, 2, 1, 3) },
      { name: "@collectionKey", range: new Range(1, 2, 1, 3) },
    ],
  },
];

function fillOutCapture(capture: NameRange): QueryCapture {
  return createTestQueryCapture(capture.name, capture.range);
}

suite("rewriteStartOfEndOf", () => {
  for (const testCase of testCases) {
    test(testCase.name, () => {
      const actual = rewriteStartOfEndOf(testCase.captures.map(fillOutCapture));
      assert.deepStrictEqual(actual, testCase.expected.map(fillOutCapture));
    });
  }
});
