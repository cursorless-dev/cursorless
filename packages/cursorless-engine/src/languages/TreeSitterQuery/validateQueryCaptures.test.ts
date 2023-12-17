import assert from "assert";
import { validateQueryCaptures } from "./validateQueryCaptures";

const testCases: { name: string; isOk: boolean; content: string }[] = [
  {
    name: "Scope captures",
    isOk: true,
    content: "(if_statement) @statement @ifStatement @comment",
  },
  {
    name: "Relationships",
    isOk: true,
    content: "(if_statement) @statement.domain @statement.interior @_.removal",
  },
  {
    name: "Position captures",
    isOk: true,
    content:
      "(if_statement) @statement.leading.startOf @statement.trailing.endOf",
  },
  {
    name: "Range captures",
    isOk: true,
    content:
      "(if_statement) @statement.removal.start @statement.interior.start.endOf",
  },
  {
    name: "Dummy capture",
    isOk: true,
    content: "(if_statement) @dummy",
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
    name: "Unknown capture",
    isOk: false,
    content: "(if_statement) @unknown",
  },
  {
    name: "Unknown relationship",
    isOk: false,
    content: "(if_statement) @statement.unknown",
  },
  {
    name: "Single wildcard",
    isOk: false,
    content: "(if_statement) @_",
  },
  {
    name: "Leading start",
    isOk: false,
    content: "(if_statement) @statement.leading.start",
  },
  {
    name: "Text fragment start",
    isOk: false,
    content: "(comment) @textFragment.start",
  },
];

suite("validateQueryCaptures", () => {
  for (const testCase of testCases) {
    const name = [testCase.isOk ? "OK" : "Error", testCase.name].join(": ");
    test(name, () => {
      try {
        validateQueryCaptures(testCase.name, testCase.content);
        assert.ok(testCase.isOk, "Expected no error");
      } catch (error) {
        assert.ok(!testCase.isOk, "Expected error");
      }
    });
  }
});
