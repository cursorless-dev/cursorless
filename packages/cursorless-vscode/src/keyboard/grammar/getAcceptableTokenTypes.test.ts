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
import { forEach, isEqual } from "lodash";
import produce from "immer";
import { stringifyTokens } from "./stringifyTokens";

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
              type: NEXT,
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
          JSON.stringify(produce(candidates, replaceSymbols), null, 2),
        );
      }
    });
  });
});

/**
 * Deep search and replaces the given property value "prevVal" with "newVal"
 */
function replaceSymbols(object: any) {
  forEach(object, (val, key) => {
    if (typeof val === "symbol") {
      object[key] = val.toString();
    } else if (typeof val === "object") {
      replaceSymbols(val);
    }
  });
}
