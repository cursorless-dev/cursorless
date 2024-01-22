import * as fs from "fs";
import * as path from "path";
import { argv } from "process";
import * as url from "url";

if (argv.length !== 3) {
  throw new Error("Expected exactly one argument");
}

const scopeType = argv[2];
const scopeTypes = ["namedFunction", "functionName"];

if (!scopeTypes.includes(scopeType)) {
  throw new Error(
    `Expected one of [${scopeTypes.join(", ")}], got ${scopeType}`,
  );
}

const functionsWithSingleCase = [
  ["id :: a -> a", "id x = x"],
  ["const :: a -> b -> a", "const x y = x"],
  ["fst :: (a, b) -> a", "fst (x, y) = x"],
];
const functionsWithMultipleCases = [
  [
    "fib :: Integer -> Integer",
    "fib 0 = 0",
    "fib 1 = 1",
    "fib n = fib (n-1) + fib (n-2)",
  ],
  [
    "map :: (a -> b) -> [a] -> [b]",
    "map f [] = []",
    "map f (x:xs) = f x : map f xs",
  ],
  ["not :: Bool -> Bool", "not True = False", "not False = True"],
];
const nonFunctions = [
  ["type Point = (Double, Double)"],
  ["data Maybe a = Nothing | Just a"],
];
function* functionParameterCases() {
  for (const singleCase of [true, false]) {
    for (const signature of [true, false]) {
      yield [singleCase, signature];
    }
  }
}
const delimiterParameterCases = [
  { kind: "anchor" },
  ...[...functionParameterCases()].map((functionParameters) =>
    Object.assign({ kind: "function" }, functionParameters),
  ),
  { kind: "otherwise" },
];
function* testParameterCases() {
  for (const startDelimiterParameters of delimiterParameterCases) {
    for (const functionParameters of functionParameterCases()) {
      for (const endDelimiterParameters of delimiterParameterCases) {
        yield {
          startDelimiterParameters,
          functionParameters,
          endDelimiterParameters,
        };
      }
    }
  }
}
function* testCases() {
  function renderFunction([functionSignature, ...functionBody], { signature }) {
    if (signature) {
      return [functionSignature, ...functionBody].join("\n");
    } else {
      return functionBody.join("\n");
    }
  }
  for (const testParameters of testParameterCases()) {
    const functionsWithSingleCaseIterator = functionsWithSingleCase.values();
    const functionsWithMultipleCasesIterator =
      functionsWithMultipleCases.values();
    const nonFunctionsIterator = nonFunctions.values();
    // eslint-disable-next-line no-inner-declarations
    function generateFunction(functionParameters) {
      if (functionParameters.singleCase) {
        return renderFunction(
          functionsWithSingleCaseIterator.next().value,
          functionParameters,
        );
      } else {
        return renderFunction(
          functionsWithMultipleCasesIterator.next().value,
          functionParameters,
        );
      }
    }
    const testCase = [];
    if (testParameters.startDelimiterParameters.kind === "function") {
      testCase.push(generateFunction(testParameters.startDelimiterParameters));
    } else if (testParameters.startDelimiterParameters.kind === "otherwise") {
      testCase.push(nonFunctionsIterator.next().value.join("\n"));
    }
    testCase.push(generateFunction(testParameters.functionParameters));
    if (testParameters.endDelimiterParameters.kind === "function") {
      testCase.push(generateFunction(testParameters.endDelimiterParameters));
    } else if (testParameters.endDelimiterParameters.kind === "otherwise") {
      testCase.push(nonFunctionsIterator.next().value.join("\n"));
    }
    testCase.push("---");
    yield testCase.join("\n\n");
  }
}
const dirname = path.dirname(url.fileURLToPath(import.meta.url));
let index = 1;
for (const testCase of testCases()) {
  fs.writeFileSync(
    path.join(dirname, `./${scopeType}${index}.scope`),
    testCase,
    { encoding: "utf-8" },
  );
  index++;
}
