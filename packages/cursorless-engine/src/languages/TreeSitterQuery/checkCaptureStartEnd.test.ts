import { Messages, Range } from "@cursorless/common";
import { QueryCapture } from "./QueryCapture";
import { checkCaptureStartEnd } from "./checkCaptureStartEnd";
import assert = require("assert");

interface TestCase {
  name: string;
  captures: Omit<QueryCapture, "allowMultiple" | "insertionDelimiter">[];
  isValid: boolean;
  expectedErrorMessageIds: string[];
}

const testCases: TestCase[] = [
  {
    name: "should return true for valid capture",
    captures: [
      {
        name: "@foo",
        range: new Range(0, 0, 0, 0),
      },
    ],
    isValid: true,
    expectedErrorMessageIds: [],
  },

  {
    name: "should return true for valid capture with start only",
    captures: [
      {
        name: "@foo.start",
        range: new Range(0, 0, 0, 0),
      },
    ],
    isValid: true,
    expectedErrorMessageIds: [],
  },

  {
    name: "should return true for valid capture with end only",
    captures: [
      {
        name: "@foo.end",
        range: new Range(0, 0, 0, 0),
      },
    ],
    isValid: true,
    expectedErrorMessageIds: [],
  },

  {
    name: "should return true for valid capture with start and end",
    captures: [
      {
        name: "@foo.start",
        range: new Range(0, 0, 0, 1),
      },
      {
        name: "@foo.end",
        range: new Range(0, 1, 0, 2),
      },
    ],
    isValid: true,
    expectedErrorMessageIds: [],
  },

  {
    name: "should show error for capture with start and end in reverse order",
    captures: [
      {
        name: "@foo.start",
        range: new Range(0, 1, 0, 2),
      },
      {
        name: "@foo.end",
        range: new Range(0, 0, 0, 1),
      },
    ],
    isValid: false,
    expectedErrorMessageIds: ["TreeSitterQuery.checkCaptures.badOrder"],
  },

  {
    name: "should show error for capture with start containing end",
    captures: [
      {
        name: "@foo.start",
        range: new Range(0, 0, 0, 2),
      },
      {
        name: "@foo.end",
        range: new Range(0, 1, 0, 2),
      },
    ],
    isValid: false,
    expectedErrorMessageIds: ["TreeSitterQuery.checkCaptures.badOrder"],
  },

  {
    name: "should show error for capture with regular and start",
    captures: [
      {
        name: "@foo",
        range: new Range(0, 0, 0, 0),
      },
      {
        name: "@foo.start",
        range: new Range(0, 1, 0, 2),
      },
    ],
    isValid: false,
    expectedErrorMessageIds: [
      "TreeSitterQuery.checkCaptures.mixRegularStartEnd",
    ],
  },

  {
    name: "should show error for capture with multiple regular",
    captures: [
      {
        name: "@foo",
        range: new Range(0, 0, 0, 0),
      },
      {
        name: "@foo",
        range: new Range(0, 1, 0, 2),
      },
    ],
    isValid: false,
    expectedErrorMessageIds: ["TreeSitterQuery.checkCaptures.duplicate"],
  },

  {
    name: "should allow capture with multiple start",
    captures: [
      {
        name: "@foo.start",
        range: new Range(0, 0, 0, 0),
      },
      {
        name: "@foo.start",
        range: new Range(0, 1, 0, 2),
      },
      {
        name: "@foo.end",
        range: new Range(0, 2, 0, 3),
      },
    ],
    isValid: true,
    expectedErrorMessageIds: [],
  },

  {
    name: "should show multiple errors",
    captures: [
      {
        name: "@foo.start",
        range: new Range(0, 0, 0, 0),
      },
      {
        name: "@foo",
        range: new Range(0, 1, 0, 2),
      },
      {
        name: "@foo",
        range: new Range(0, 2, 0, 3),
      },
      {
        name: "@foo.end",
        range: new Range(0, 2, 0, 3),
      },
    ],
    isValid: false,
    expectedErrorMessageIds: [
      "TreeSitterQuery.checkCaptures.mixRegularStartEnd",
      "TreeSitterQuery.checkCaptures.duplicate",
    ],
  },
];

suite("checkCaptureStartEnd", () => {
  for (const testCase of testCases) {
    test(testCase.name, () => {
      const actualErrorIds: string[] = [];
      const messages: Messages = {
        async showMessage(_type, id, _message) {
          actualErrorIds.push(id);
          return undefined;
        },
      };

      const result = checkCaptureStartEnd(
        testCase.captures.map((capture) => ({
          ...capture,
          allowMultiple: false,
          insertionDelimiter: undefined,
        })),
        messages,
      );
      assert(result === testCase.isValid);
      assert.deepStrictEqual(actualErrorIds, testCase.expectedErrorMessageIds);
    });
  }
});
