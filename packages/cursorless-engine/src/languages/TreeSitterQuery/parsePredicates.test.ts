import assert from "assert";
import { parsePredicates } from "./parsePredicates";
import { PredicateResult } from "web-tree-sitter";

const predicates: PredicateResult[][] = [
  [
    // (#not-type? @statement comment)
    // Valid
    {
      operator: "not-type?",
      operands: [
        {
          type: "capture",
          name: "statement",
        },
        {
          type: "string",
          value: "comment",
        },
      ],
    },

    // (#not-parent-type? @statement)
    // Error: too few args
    {
      operator: "not-parent-type?",
      operands: [
        {
          type: "capture",
          name: "statement",
        },
      ],
    },

    // (#not-parent-type? statement foo)
    // Error: capture names must be prefixed with @
    {
      operator: "not-parent-type?",
      operands: [
        {
          type: "string",
          value: "statement",
        },
        {
          type: "string",
          value: "foo",
        },
      ],
    },

    // (#is-nth-child? @statement hello)
    // Error: expected an integer
    {
      operator: "is-nth-child?",
      operands: [
        {
          type: "capture",
          name: "statement",
        },
        {
          type: "string",
          value: "hello",
        },
      ],
    },

    // (#not-type? @statement comment @foo)
    // Error: expected a string for arg 2
    {
      operator: "not-type?",
      operands: [
        {
          type: "capture",
          name: "statement",
        },
        {
          type: "string",
          value: "comment",
        },
        {
          type: "capture",
          name: "foo",
        },
      ],
    },
  ],
];

const expectedErrors = [
  {
    patternIdx: 0,
    predicateIdx: 1,
    error: "Too few arguments",
  },
  {
    patternIdx: 0,
    predicateIdx: 2,
    error:
      "Error on argument 0 (`statement`): Capture names must be prefixed with @",
  },
  {
    patternIdx: 0,
    predicateIdx: 3,
    error: "Error on argument 1 (`hello`): Expected an integer",
  },
  {
    error:
      "Error on argument 2 (`@foo`): Expected string, but received capture",
    patternIdx: 0,
    predicateIdx: 4,
  },
];

suite("parsePredicates", () => {
  test("should return errors", () => {
    const { errors } = parsePredicates(predicates);

    assert.deepEqual(errors, expectedErrors);
  });
});
