import assert from "assert";
import { Grammar, Parser } from "nearley";
import { KeyDescriptor } from "../TokenTypeHelpers";
import grammar from "./generated/grammar";
import {
  AcceptableTokenType,
  MISSING,
  NEXT,
  getAcceptableTokenTypes,
} from "./getAcceptableTokenTypes";
import { isEqual } from "lodash-es";
import { stringifyTokens } from "./stringifyTokens";

interface TestCase {
  /**
   * The tokens to feed to the parser before checking for acceptable token types
   */
  tokens: KeyDescriptor[];

  /**
   * Expect these token types to be acceptable; note that this list doesn't need
   * to include all acceptable token types, just the ones that we want to test
   * for.
   */
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
            shape: NEXT,
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
            offset: MISSING,
            direction: "forward",
            scopeType: MISSING,
          },
          mode: "replace",
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
          mode: "replace",
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
              type: NEXT,
            },
          },
          mode: "replace",
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
          mode: "replace",
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
    test(`after \`${stringifyTokens(tokens)}\``, () => {
      parser.feed(tokens);
      for (const value of expected) {
        // filter by type first for shorter error messages
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
          "Relevant candidates (note that symbols will be missing):\n" +
            JSON.stringify(candidates, null, 2),
        );
      }
    });
  });
});
