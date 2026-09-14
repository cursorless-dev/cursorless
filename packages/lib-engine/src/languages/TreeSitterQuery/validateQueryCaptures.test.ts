import assert from "node:assert/strict";
import { FakeIDE } from "@cursorless/lib-common";
import { validateQueryCaptures } from "./validateQueryCaptures";

const testCases: { name: string; isOk: boolean; content: string }[] = [
  {
    name: "Statement/name/value iteration alias",
    isOk: true,
    content: "(compound_statement) @statementNameValue.iteration",
  },
  {
    name: "Statement/name/value iteration boundaries",
    isOk: true,
    content:
      '(compound_statement "{" @statementNameValue.iteration.start.endOf "}" @statementNameValue.iteration.end.startOf)',
  },
  {
    name: "Statement/name/value iteration domain",
    isOk: true,
    content: "(compound_statement) @statementNameValue.iteration.domain",
  },
  {
    name: "Unknown iteration relationship",
    isOk: false,
    content: "(compound_statement) @statementNameValue.iteration.unknown",
  },
  {
    name: "Statement/name/value/type iteration boundaries",
    isOk: true,
    content:
      '(compound_statement "{" @statementNameValueType.iteration.start.endOf "}" @statementNameValueType.iteration.end.startOf)',
  },
  {
    name: "Unknown type iteration relationship",
    isOk: false,
    content: "(compound_statement) @statementNameValueType.iteration.unknown",
  },
  {
    name: "Alias without iteration",
    isOk: false,
    content: "(compound_statement) @statementNameValue",
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
