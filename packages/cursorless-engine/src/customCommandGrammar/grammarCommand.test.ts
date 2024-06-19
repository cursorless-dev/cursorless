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
    input: "copy token line state",
    expectedOutput: {
      name: "copyToClipboard",
      target: {
        type: "primitive",
        modifiers: [
          { type: "containingScope", scopeType: { type: "token" } },
          { type: "containingScope", scopeType: { type: "line" } },
          { type: "containingScope", scopeType: { type: "statement" } },
        ],
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
      //   console.log(JSON.stringify(parseAction(input), null, 4));
      //   assert.ok(true);
      assert.deepStrictEqual(parseAction(input), expectedOutput);
    });
  });
});
