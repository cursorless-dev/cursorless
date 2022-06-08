import * as assert from "assert";
import { tokenize } from "../../core/tokenizer";
import { flatten, range } from "lodash";
import { SupportedLanguageId } from "../../languages/constants";

type TestCase = [string, string[]];
type LanguageTokenizerTests = Partial<
  Record<
    SupportedLanguageId,
    { tests: TestCase[]; exclusionPredicate?: (input: string) => boolean }
  >
>;
const singleSymbolTests: TestCase[] = getAsciiSymbols().map((s) => [s, [s]]);

const tests: TestCase[] = [
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
  ["my::variable", ["my", "::", "variable"]],
  ["_a", ["_a"]],
  // Strings
  ['"my variable"', ['"', "my", "variable", '"']],
  ["'my variable'", ["'", "my", "variable", "'"]],
  // All single ascii symbols
  ...singleSymbolTests,
  // Repeatable symbols
  ["---|||///+++", ["---", "|||", "///", "+++"]],
  // Non repeatable symbols
  ["!!(()){{}}", ["!", "!", "(", "(", ")", ")", "{", "{", "}", "}"]],
  // Fixed tokens
  ["!=>=!====", ["!=", ">=", "!==", "=="]],
  ["=>", ["=>"]],
  ["::", ["::"]],
  ["->", ["->"]],
  ["??", ["??"]],
  ["\\r\\n\\t", ["\\r", "\\n", "\\t"]],
  ['"""hello"""', ['"""', "hello", '"""']],
  ["```typescript", ["```", "typescript"]],
  ['""""""', ['"""', '"""']],
  ["``````", ["```", "```"]],
  ['""', ['"', '"']],
  ["''", ["'", "'"]],
  ["``", ["`", "`"]],
  // Comments
  ["// Hello world", ["//", "Hello", "world"]],
  ["/* Hello world */", ["/*", "Hello", "world", "*/"]],
  ["<!-- Hello world -->", ["<!--", "Hello", "world", "-->"]],
  // Hex colors
  ["#aaaaaa", ["#", "aaaaaa"]],
  ["#11aaaa", ["#", "11aaaa"]],
  ["#aa11aa", ["#", "aa11aa"]],
  ["#aaaa11", ["#", "aaaa11"]],
  ["#111111", ["#", "111111"]],
  // Unicode characters
  ["aåäöb", ["aåäöb"]],
];

const languageTokenizerTests: LanguageTokenizerTests = {
  css: {
    tests: [
      ["min-height", ["min-height"]],
      ["-webkit-font-smoothing", ["-webkit-font-smoothing"]],
      ["(min-width: 400px)", ["(", "min-width", ":", "400px", ")"]],
      ["prefers-reduced-motion", ["prefers-reduced-motion"]],
    ],
    // Leave kebab and dashes to css language specific tests.
    exclusionPredicate: (input: string) => input.match("-") == null,
  },
};

suite("tokenizer", () => {
  tests.forEach(([input, expectedOutput]) => {
    test(`tokenizer test, input: ${input}`, () => {
      const output = tokenize(input, "anyLang", (match) => match[0]);
      assert.deepStrictEqual(output, expectedOutput);
    });
  });

  Object.entries(languageTokenizerTests).forEach(
    ([
      language,
      { tests: languageSpecificTests, exclusionPredicate = () => true },
    ]) => {
      languageSpecificTests.forEach(([input, expectedOutput]) => {
        test(`${language} custom tokenizer, input: ${input}`, () => {
          const output = tokenize(input, language, (match) => match[0]);
          assert.deepStrictEqual(output, expectedOutput);
        });
      });

      tests.forEach(([input, expectedOutput]) => {
        if (exclusionPredicate(input)) {
          return;
        }
        test(`${language} custom tokenizer, input: ${input}`, () => {
          const output = tokenize(input, language, (match) => match[0]);
          assert.deepStrictEqual(output, expectedOutput);
        });
      });
    }
  );
});

/**
    Returns an array of single non-alphanumeric symbols in various ascii ranges to make sure they don't get dropped by the tokeniser
*/
function getAsciiSymbols() {
  const rangesToTest = [
    ["!", "/"],
    [":", "@"],
    ["[", "`"],
    ["{", "~"],
  ];
  return flatten(
    rangesToTest.map(([start, end]) =>
      range(start.charCodeAt(0), end.charCodeAt(0) + 1).map((charCode) =>
        String.fromCharCode(charCode)
      )
    )
  );
}
