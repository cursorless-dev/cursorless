import { FakeIDE } from "@cursorless/common";
import assert from "assert";
import { injectIde } from "../../singletons/ide.singleton";
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
      "(if_statement) @statement.startOf @statement.leading.startOf @statement.trailing.endOf",
  },
  {
    name: "Range captures",
    isOk: true,
    content:
      "(if_statement) @statement.start @statement.start.endOf @statement.removal.start @statement.interior.start.endOf",
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
    name: "Text fragment removal",
    isOk: false,
    content: "(comment) @textFragment.removal",
  },
];

suite("validateQueryCaptures", function () {
  suiteSetup(() => {
    injectIde(new FakeIDE());
  });

  for (const testCase of testCases) {
    const name = [testCase.isOk ? "OK" : "Error", testCase.name].join(": ");

    test(name, () => {
      const runTest = () =>
        validateQueryCaptures(testCase.name, testCase.content);

      if (testCase.isOk) {
        assert.doesNotThrow(runTest);
      } else {
        assert.throws(runTest);
      }
    });
  }
});
