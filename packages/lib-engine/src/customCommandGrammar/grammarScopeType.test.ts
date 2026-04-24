import * as assert from "node:assert/strict";
import type { ScopeType } from "@cursorless/lib-common";
import { parseScopeType } from "./parseCommand";

interface TestCase {
  input: string;
  expectedOutput: ScopeType;
}

const testCases: TestCase[] = [
  {
    input: "funk",
    expectedOutput: {
      type: "namedFunction",
    },
  },
  {
    input: "curly",
    expectedOutput: {
      type: "surroundingPair",
      delimiter: "curlyBrackets",
    },
  },
  {
    input: "string",
    expectedOutput: {
      type: "surroundingPair",
      delimiter: "string",
    },
  },
];

suite("custom grammar: scope types", () => {
  for (const { input, expectedOutput } of testCases) {
    test(input, () => {
      assert.deepEqual(parseScopeType(input), expectedOutput);
    });
  }
});
