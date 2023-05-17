import * as assert from "assert";
import { flatten, range } from "lodash";
import { tokenize } from ".";
import { unitTestSetup } from "../test/unitTestSetup";

type TestCase = [string, string[]];
/**
 * Language-specific tokenizer test configuration object.  Note that these
 * languages don't actually behave differently in production, we just mock
 * overriding the word separator for a few languages to make sure that
 * overriding works.
 */
interface LanguageTokenizerTests {
  wordSeparators: string[];

  /** Language-specific test cases to run in addition to the global tests for this language */
  additionalTests: TestCase[];

  /**
   * By default we run all global tests in the given language, in addition to the specific tests.  We exclude global test inputs that match this predicate.
   */
  exclusionPredicate?: (input: string) => boolean;
}
const singleSymbolTests: TestCase[] = getAsciiSymbols().map((s) => [s, [s]]);

/** Tokenizer tests that will be run on the default tokenizer, as well as on all language-specific tokenizers */
const globalTests: TestCase[] = [
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
  ["\u006E\u0303", ["\u006E\u0303"]], // ñ using combining mark
  // Windows filepath
  [
    "tests\\recorded\\typescript\\name",
    ["tests", "\\", "recorded", "\\", "typescript", "\\", "name"],
  ],
];

const cssDialectTokenizerTests: LanguageTokenizerTests = {
  wordSeparators: ["-", "_"],
  additionalTests: [
    ["min-height", ["min-height"]],
    ["-webkit-font-smoothing", ["-webkit-font-smoothing"]],
    ["(min-width: 400px)", ["(", "min-width", ":", "400px", ")"]],
    ["prefers-reduced-motion", ["prefers-reduced-motion"]],
  ],
  // Leave kebab and dashes to css language specific tests.
  exclusionPredicate: (input: string) => !!input.match("-"),
};

const shellScriptDialectTokenizerTests: LanguageTokenizerTests = {
  wordSeparators: ["-", "_"],
  additionalTests: [
    ["--commit-hooks", ["--commit-hooks"]],
    [
      "patch --force --commit-hooks $MY_SNAKE_VAR",
      ["patch", "--force", "--commit-hooks", "$", "MY_SNAKE_VAR"],
    ],
  ],
  // Leave kebab and dashes to css language specific tests.
  exclusionPredicate: (input: string) => !!input.match("-"),
};

const languageTokenizerTests: Record<string, LanguageTokenizerTests> = {
  css: cssDialectTokenizerTests,
  scss: cssDialectTokenizerTests,
  shellscript: shellScriptDialectTokenizerTests,
};

suite("tokenizer", () => {
  unitTestSetup((fake) => {
    Object.entries(languageTokenizerTests).forEach(
      ([languageId, { wordSeparators }]) => {
        fake.configuration.mockConfigurationScope(
          {
            languageId,
          },
          {
            wordSeparators,
          },
        );
      },
    );
  });

  globalTests.forEach(([input, expectedOutput]) => {
    test(`tokenizer test, input: "${input}"`, () => {
      const output = tokenize(input, "anyLang", (match) => match[0]);
      assert.deepStrictEqual(output, expectedOutput);
    });
  });

  Object.entries(languageTokenizerTests).forEach(
    ([
      language,
      {
        additionalTests: languageSpecificTests,
        exclusionPredicate = () => false,
      },
    ]) => {
      const tests = [
        ...languageSpecificTests,
        ...globalTests.filter(
          ([input, _expectedOutput]) => !exclusionPredicate(input),
        ),
      ];

      tests.forEach(([input, expectedOutput]) => {
        test(`${language} custom tokenizer, input: "${input}"`, () => {
          const output = tokenize(input, language, (match) => match[0]);
          assert.deepStrictEqual(output, expectedOutput);
        });
      });
    },
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
        String.fromCharCode(charCode),
      ),
    ),
  );
}
