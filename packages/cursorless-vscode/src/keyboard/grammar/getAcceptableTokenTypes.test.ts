import assert from "assert";
import { Grammar, Parser } from "nearley";
import { KeyDescriptor } from "../TokenTypeHelpers";
import grammar from "./generated/grammar";
import {
  AcceptableTokenType,
  MISSING,
  getAcceptableTokenTypes,
} from "./getAcceptableTokenTypes";
import { isEqual } from "lodash";

interface TestCase {
  tokens: KeyDescriptor[];
  expected: AcceptableTokenType[];
}

const testCases: TestCase[] = [
  {
    tokens: [],
    expected: [
      {
        type: "shape",
        command: "targetDecoratedMark",
        partialArg: {
          decoratedMark: {
            shape: MISSING,
          },
          mode: "replace",
        },
      },
      {
        type: "combineColorAndShape",
        command: "targetDecoratedMark",
        partialArg: {
          decoratedMark: {
            color: MISSING,
            shape: MISSING,
          },
          mode: "replace",
        },
      },
      {
        type: "digit",
        command: "modifyTarget",
        partialArg: {
          modifier: {
            type: "relativeScope",
            length: MISSING,
            offset: 0,
            direction: "forward",
            scopeType: MISSING,
          },
        },
      },
      {
        type: "digit",
        command: "modifyTarget",
        partialArg: {
          modifier: {
            type: "relativeScope",
            length: MISSING,
            offset: MISSING,
            direction: "forward",
            scopeType: MISSING,
          },
        },
      },
      {
        type: "nextPrev",
        command: "modifyTarget",
        partialArg: {
          modifier: {
            type: "relativeScope",
            length: MISSING,
            offset: 1,
            direction: "forward",
            scopeType: MISSING,
          },
        },
      },
    ],
  },
  {
    tokens: [{ type: "digit", value: 3 }],
    expected: [
      {
        type: "simpleScopeTypeType",
        command: "modifyTarget",
        partialArg: {
          modifier: {
            type: "relativeScope",
            length: 3,
            offset: 0,
            direction: "forward",
            scopeType: {
              type: MISSING,
            },
          },
        },
      },
      {
        type: "nextPrev",
        command: "modifyTarget",
        partialArg: {
          modifier: {
            type: "relativeScope",
            length: MISSING,
            offset: 3,
            direction: "forward",
            scopeType: MISSING,
          },
        },
      },
    ],
  },
];

suite("keyboard.getAcceptableTokenTypes", () => {
  let parser: Parser;
  setup(() => {
    parser = new Parser(Grammar.fromCompiled(grammar));
  });

  testCases.forEach(({ tokens, expected }) => {
    test(`should parse \`${stringifyTokens(tokens)}\``, () => {
      parser.feed(tokens);
      for (const value of expected) {
        const candidates = getAcceptableTokenTypes(parser).filter(
          ({ type }) => type === value.type,
        );
        const fullValue = {
          type: value.type,
          command: value.command,
          partialArg: {
            type: value.command,
            arg: value.partialArg,
          },
        };
        assert(
          candidates.some((result) => isEqual(result, fullValue)),
          JSON.stringify(candidates, null, 2),
        );
      }
    });
  });
});

function stringifyTokens(tokens: any[]) {
  return tokens
    .map((token) => {
      let ret = token.type;
      if (token.value != null) {
        ret += `:${JSON.stringify(token.value)}`;
      }
      return ret;
    })
    .join(" ");
}
