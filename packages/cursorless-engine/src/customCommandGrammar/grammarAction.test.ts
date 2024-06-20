import { type ActionDescriptor } from "@cursorless/common";
import assert from "assert";
import { parseAction } from "./parseCommand";
import { WithPlaceholders } from "./WithPlaceholders";

interface TestCase {
  input: string;
  expectedOutput: WithPlaceholders<ActionDescriptor>;
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
    input: "take block $1",
    expectedOutput: {
      name: "setSelection",
      target: {
        type: "primitive",
        modifiers: [
          { type: "containingScope", scopeType: { type: "paragraph" } },
        ],
        mark: { type: "target", target: { type: "placeholder", index: 0 } },
      },
    },
  },
  {
    input: "move $1 after line $2",
    expectedOutput: {
      name: "moveToTarget",
      source: {
        type: "primitive",
        mark: {
          type: "target",
          target: {
            type: "placeholder",
            index: 0,
          },
        },
      },
      destination: {
        type: "primitive",
        insertionMode: "after",
        target: {
          type: "primitive",
          modifiers: [
            {
              type: "containingScope",
              scopeType: {
                type: "line",
              },
            },
          ],
          mark: {
            type: "target",
            target: {
              type: "placeholder",
              index: 1,
            },
          },
        },
      },
    },
  },
  {
    input: "bring token to line",
    expectedOutput: {
      name: "replaceWithTarget",
      source: {
        type: "primitive",
        modifiers: [
          {
            type: "containingScope",
            scopeType: {
              type: "token",
            },
          },
        ],
      },
      destination: {
        type: "primitive",
        insertionMode: "to",
        target: {
          type: "primitive",
          modifiers: [
            {
              type: "containingScope",
              scopeType: {
                type: "line",
              },
            },
          ],
        },
      },
    },
  },
];

suite("custom grammar: actions", () => {
  testCases.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(
        parseAction(input),
        expectedOutput,
        JSON.stringify(parseAction(input), null, 4),
      );
    });
  });
});
