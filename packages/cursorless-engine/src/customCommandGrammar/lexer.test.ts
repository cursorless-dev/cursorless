import * as assert from "assert";
import { unitTestSetup } from "../test/unitTestSetup";
import { NearleyLexer, NearleyToken } from "./CommandLexer";
import { lexer } from "./lexer";

interface Fixture {
  input: string;
  expectedOutput: NearleyToken[];
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
  {
    input: "<target> <target1> <target2>",
    expectedOutput: [
      {
        type: "placeholderTarget",
        value: "",
      },
      {
        type: "placeholderTarget",
        value: "1",
      },
      {
        type: "placeholderTarget",
        value: "2",
      },
    ],
  },
];

suite("custom grammar: lexer", () => {
  unitTestSetup();

  fixtures.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(
        Array.from(iterateTokens(lexer, input)).map(({ type, value }) => ({
          type,
          value,
        })),
        expectedOutput,
      );
    });
  });
});

function* iterateTokens(lexer: NearleyLexer, input: string) {
  lexer.reset(input);

  let token;
  while (true) {
    token = lexer.next();
    if (!token) {
      break;
    }
    yield token;
  }
}
