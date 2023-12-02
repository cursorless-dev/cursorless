import { Range, TextDocument } from "@cursorless/common";
import { SyntaxNode } from "web-tree-sitter";
import { MutableQueryCapture } from "./QueryCapture";
import { rewriteStartOfEndOf } from "./rewriteStartOfEndOf";
import assert from "assert";

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

function fillOutCapture(capture: NameRange): MutableQueryCapture {
  return {
    ...capture,
    allowMultiple: false,
    insertionDelimiters: undefined,
    document: null as unknown as TextDocument,
    node: null as unknown as SyntaxNode,
  };
}

suite("rewriteStartOfEndOf", () => {
  for (const testCase of testCases) {
    test(testCase.name, () => {
      const actual = rewriteStartOfEndOf(testCase.captures.map(fillOutCapture));
      assert.deepStrictEqual(actual, testCase.expected.map(fillOutCapture));
    });
  }
});
