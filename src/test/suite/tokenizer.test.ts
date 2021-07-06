import * as assert from "assert";
import { tokenize } from "../../tokenizer";

const tests = <[string | string[]]>(<unknown>[
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
  ...getSymbols().map((s) => [s, [s]]),
  ["!_|||>{.", ["!", "_", "|||", ">", "{", "."]],
  // Fixed tokens
  ["!!=>===", ["!", "!=", ">=", "=="]],
]);

suite("tokenizer", () => {
  tests.forEach(([input, expectedOutput]) => {
    test(`tokenizer ${input}`, () => {
      const output = tokenize(input, (match) => match[0]);
      assert.deepStrictEqual(output, expectedOutput);
    });
  });
});

function getSymbols() {
  const results = <string[]>[];
  const range = [33, 48, 58, 65, 91, 97, 123, 126];
  for (let i = 0; i < range.length; i += 2) {
    for (let j = range[i]; j < range[i + 1]; ++j) {
      results.push(String.fromCharCode(j));
    }
  }
  return results;
}
