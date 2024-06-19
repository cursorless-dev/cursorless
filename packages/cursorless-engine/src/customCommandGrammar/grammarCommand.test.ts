import { type ActionDescriptor } from "@cursorless/common";
import assert from "assert";
import { parseAction } from "./parseCommand";

interface TestCase {
  input: string;
  expectedOutput: ActionDescriptor;
}

const testCases: TestCase[] = [
  {
    input: "chuck funk",
    expectedOutput: {
      name: "remove",
      target: {
        type: "primitive",
        modifiers: [
          { type: "containingScope", scopeType: { type: "namedFunction" } },
        ],
      },
    },
  },
  {
    input: "change this",
    expectedOutput: {
      name: "clearAndSetSelection",
      target: {
        type: "primitive",
        mark: { type: "cursor" },
      },
    },
  },
  {
    input: "take block <target>",
    expectedOutput: {
      name: "setSelection",
      target: {
        type: "primitive",
        modifiers: [
          { type: "containingScope", scopeType: { type: "paragraph" } },
        ],
        mark: { type: "placeholder" },
      },
    },
  },
];

suite("custom grammar: actions", () => {
  testCases.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(parseAction(input), expectedOutput);
    });
  });
});
