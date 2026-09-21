import assert from "node:assert/strict";
import { FakeIDE } from "@cursorless/lib-common";
import { validateQueryCaptures } from "./validateQueryCaptures";

const testCases: { name: string; isOk: boolean; content: string }[] = [
  {
    name: "Statement/name/value iteration group",
    isOk: true,
    content: "(compound_statement) @G_statement_name_value.iteration",
  },
  {
    name: "Statement/name/value iteration boundaries",
    isOk: true,
    content:
      '(compound_statement "{" @G_statement_name_value.iteration.start.endOf "}" @G_statement_name_value.iteration.end.startOf)',
  },
  {
    name: "Statement/name/value iteration domain",
    isOk: true,
    content: "(compound_statement) @G_statement_name_value.iteration.domain",
  },
  {
    name: "Unknown iteration relationship",
    isOk: false,
    content: "(compound_statement) @G_statement_name_value.iteration.unknown",
  },
  {
    name: "Statement/name/value/type iteration boundaries",
    isOk: true,
    content:
      '(compound_statement "{" @G_statement_name_value_type.iteration.start.endOf "}" @G_statement_name_value_type.iteration.end.startOf)',
  },
  {
    name: "Unknown type iteration relationship",
    isOk: false,
    content:
      "(compound_statement) @G_statement_name_value_type.iteration.unknown",
  },
  {
    name: "Old alias",
    isOk: false,
    content: "(compound_statement) @statementNameValue.iteration",
  },
  {
    name: "Old type alias",
    isOk: false,
    content: "(compound_statement) @statementNameValueType.iteration",
  },
  {
    name: "Group without suffix",
    isOk: true,
    content: "(compound_statement) @G_value_name_namedFunction",
  },
  {
    name: "Group with start suffix",
    isOk: true,
    content: "(compound_statement) @G_value_name_namedFunction.start",
  },
  {
    name: "Single member group",
    isOk: false,
    content: "(compound_statement) @G_value",
  },
  {
    name: "Single member group with suffix",
    isOk: false,
    content: "(compound_statement) @G_value.start",
  },
  {
    name: "Unknown first group member",
    isOk: false,
    content: "(compound_statement) @G_typo_name.iteration",
  },
  {
    name: "Unknown middle group member",
    isOk: false,
    content: "(compound_statement) @G_statement_typo_value.iteration",
  },
  {
    name: "Unknown last group member",
    isOk: false,
    content: "(compound_statement) @G_statement_name_typo.iteration",
  },
  {
    name: "Empty group",
    isOk: false,
    content: "(compound_statement) @G_",
  },
  {
    name: "Empty group member",
    isOk: false,
    content: "(compound_statement) @G_statement__value.iteration",
  },
  {
    name: "Scope captures",
    isOk: true,
    content: "(if_statement) @statement @ifStatement @comment @interior",
  },
  {
    name: "Relationships",
    isOk: true,
    content: "(if_statement) @statement.domain @_.removal",
  },
  {
    name: "Position captures",
    isOk: true,
    content:
      "(if_statement) @statement.leading.startOf @statement.trailing.endOf",
  },
  {
    name: "Bare startOf capture",
    isOk: false,
    content: "(if_statement) @statement.startOf",
  },
  {
    name: "Bare endOf capture",
    isOk: false,
    content: "(if_statement) @statement.endOf",
  },
  {
    name: "Range captures",
    isOk: true,
    content:
      "(if_statement) @statement.start @statement.start.endOf @statement.removal.start",
  },
  {
    name: "Dummy capture",
    isOk: true,
    content: "(if_statement) @_foo",
  },
  {
    name: "No range dummy relationships",
    isOk: false,
    content: "(if_statement) @_foo.start @_foo.startOf",
  },
  {
    name: "Text fragment",
    isOk: true,
    content: "(comment) @textFragment",
  },
  {
    name: "Iteration",
    isOk: true,
    content: "(document) @statement.iteration @statement.iteration.domain",
  },
  {
    name: "Unknown capture in comment",
    isOk: true,
    content: ";; (if_statement) @unknown",
  },
  {
    name: "@ ending string",
    isOk: true,
    content: '"return@"',
  },
  {
    name: "Unknown capture",
    isOk: false,
    content: "(if_statement) @unknown",
  },
  {
    name: "Unknown capture before valid capture",
    isOk: false,
    content: "(if_statement) @unknown @statement",
  },
  {
    name: "Unknown capture between valid captures",
    isOk: false,
    content: "(if_statement) @statement @unknown @interior",
  },
  {
    name: "Unknown capture before comment",
    isOk: false,
    content: "(if_statement) @unknown ;; @statement",
  },
  {
    name: "Indented and inline comments",
    isOk: true,
    content: "  ;; @unknown\n(if_statement) @statement ; @unknown",
  },
  {
    name: "Captures inside strings",
    isOk: true,
    content: '(#eq? @statement "text @unknown ; @other")',
  },
  {
    name: "Escaped quotes inside strings",
    isOk: true,
    content: String.raw`(#eq? @statement "text \" @unknown")`,
  },
  {
    name: "Unknown capture after string",
    isOk: false,
    content: '("@ignored" @unknown @statement)',
  },
  {
    name: "Unknown relationship",
    isOk: false,
    content: "(if_statement) @statement.unknown",
  },
  {
    name: "Single @",
    isOk: false,
    content: "(if_statement) @",
  },
  {
    name: "Single wildcard",
    isOk: false,
    content: "(if_statement) @_",
  },
  {
    name: "Wildcard start",
    isOk: false,
    content: "(if_statement) @_.start",
  },
  {
    name: "Leading start",
    isOk: false,
    content: "(if_statement) @statement.leading.start",
  },
];

suite("validateQueryCaptures", () => {
  const ide = new FakeIDE();

  for (const testCase of testCases) {
    const name = [testCase.isOk ? "OK" : "Error", testCase.name].join(": ");

    test(name, () => {
      const runTest = () =>
        validateQueryCaptures(ide, testCase.name, testCase.content);

      if (testCase.isOk) {
        assert.doesNotThrow(runTest);
      } else {
        assert.throws(runTest);
      }
    });
  }
});
