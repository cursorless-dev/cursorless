import * as assert from "assert";
import { unitTestSetup } from "../test/unitTestSetup";
import { lexer } from "./lexer";

interface Token {
  type: string;
  value: string;
}

interface Fixture {
  input: string;
  expectedOutput: Token[];
}

const fixtures: Fixture[] = [
  {
    input: "chuck",
    expectedOutput: [
      {
        type: "simpleActionName",
        value: "remove",
      },
    ],
  },
  {
    input: "funk",
    expectedOutput: [
      {
        type: "simpleScopeTypeType",
        value: "namedFunction",
      },
    ],
  },
  {
    input: "curly",
    expectedOutput: [
      {
        type: "pairedDelimiter",
        value: "curlyBrackets",
      },
    ],
  },
  {
    input: "state name",
    expectedOutput: [
      {
        type: "simpleScopeTypeType",
        value: "statement",
      },
      {
        type: "ws",
        value: " ",
      },
      {
        type: "simpleScopeTypeType",
        value: "name",
      },
    ],
  },
  {
    input: "funk name",
    expectedOutput: [
      {
        type: "simpleScopeTypeType",
        value: "functionName",
      },
    ],
  },
  {
    input: "this",
    expectedOutput: [
      {
        type: "simpleMarkType",
        value: "cursor",
      },
    ],
  },
];

suite("custom grammar: lexer", () => {
  unitTestSetup();

  fixtures.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(
        Array.from(lexer.reset(input)).map(({ type, value }) => ({
          type,
          value,
        })),
        expectedOutput,
      );
    });
  });
});
