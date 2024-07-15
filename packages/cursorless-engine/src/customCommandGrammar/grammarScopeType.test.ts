import assert from "assert";
import { ScopeType } from "@cursorless/common";
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
  testCases.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(parseScopeType(input), expectedOutput);
    });
  });
});
