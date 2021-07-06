import * as assert from "assert";
import { tokenize } from "../../tokenizer";
import { flatten, range } from "lodash";

type TestType = [string, string[]][];
const singleSymbolTests: TestType = getAsciiSymbols().map((s) => [s, [s]]);

const tests: TestType = [
  // Numbers
  ["0.0 0 1 120 2.5 0.1", ["0.0", "0", "1", "120", "2.5", "0.1"]],
  // Semantic versioning
  ["1.22.4", ["1", ".", "22", ".", "4"]],
  // Formatters and identifiers
  ["my variable", ["my", "variable"]],
  ["My Variable", ["My", "Variable"]],
  ["myVariable", ["myVariable"]],
  ["MyVariable", ["MyVariable"]],
  ["my_variable", ["my_variable"]],
  ["MY_VARIABLE", ["MY_VARIABLE"]],
  ["my__variable", ["my__variable"]],
  ["my-variable", ["my", "-", "variable"]],
  ["my.variable", ["my", ".", "variable"]],
  ["my/variable", ["my", "/", "variable"]],
  ["my::variable", ["my", ":", ":", "variable"]],
  // Strings
  ['"my variable"', ['"', "my", "variable", '"']],
  ["'my variable'", ["'", "my", "variable", "'"]],
  // Symbols incl repeatable
  ...singleSymbolTests,
  ["!_|||>{.-----()", ["!", "_", "|||", ">", "{", ".", "-----", "(", ")"]],
  // Fixed tokens
  ["!!=>=!====", ["!", "!=", ">=", "!==", "=="]],
  // Comments
  ["// Hello world", ["//", "Hello", "world"]],
];

suite("tokenizer", () => {
  tests.forEach(([input, expectedOutput]) => {
    test(`tokenizer ${input}`, () => {
      const output = tokenize(input, (match) => match[0]);
      assert.deepStrictEqual(output, expectedOutput);
    });
  });
});

/**
    Return an array of all non-alnum symbols in the ascii range
*/ 
function getAsciiSymbols() {
  const rangesToTest = [["!", "/"], [":", "@"], ["[", "`"], ["{", "~"]];
  return flatten(
    rangesToTest.map(([start, end]) =>
      range(start.charCodeAt(0), end.charCodeAt(0) + 1).map((charCode) =>
        String.fromCharCode(charCode)
      )
    )
  );
}
