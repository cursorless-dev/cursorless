import {
  ModifierType,
  SimpleScopeTypeType,
  SurroundingPairName,
  CompositeKeyMap,
} from "@cursorless/common";

export const modifiers = {
  excludeInterior: "bounds",
  toRawSelection: "just",
  leading: "leading",
  trailing: "trailing",
  keepContentFilter: "content",
  keepEmptyFilter: "empty",
  inferPreviousMark: "its",
  startOf: "start of",
  endOf: "end of",
  interiorOnly: "inside",
  extendThroughStartOf: "head",
  extendThroughEndOf: "tail",
  everyScope: "every",

  containingScope: null,
  ordinalScope: null,
  relativeScope: null,
  modifyIfUntyped: null,
  cascading: null,
  range: null,
} as const satisfies Record<ModifierType, string | null>;

export const modifiersExtra = {
  first: "first",
  last: "last",
  previous: "previous",
  next: "next",
  forward: "forward",
  backward: "backward",
};

export const scopeSpokenForms = {
  argumentOrParameter: "arg",
  attribute: "attribute",
  functionCall: "call",
  functionCallee: "callee",
  className: "class name",
  class: "class",
  comment: "comment",
  functionName: "funk name",
  namedFunction: "funk",
  ifStatement: "if state",
  instance: "instance",
  collectionItem: "item",
  collectionKey: "key",
  anonymousFunction: "lambda",
  list: "list",
  map: "map",
  name: "name",
  regularExpression: "regex",
  section: "section",
  sectionLevelOne: "one section",
  sectionLevelTwo: "two section",
  sectionLevelThree: "three section",
  sectionLevelFour: "four section",
  sectionLevelFive: "five section",
  sectionLevelSix: "six section",
  selector: "selector",
  statement: "state",
  string: "string",
  branch: "branch",
  type: "type",
  value: "value",
  condition: "condition",
  unit: "unit",
  //  XML, JSX
  xmlElement: "element",
  xmlBothTags: "tags",
  xmlStartTag: "start tag",
  xmlEndTag: "end tag",
  // LaTeX
  part: "part",
  chapter: "chapter",
  subSection: "subsection",
  subSubSection: "subsubsection",
  namedParagraph: "paragraph",
  subParagraph: "subparagraph",
  environment: "environment",
  // Talon
  command: "command",
  // Text-based scope types
  character: "char",
  word: "word",
  token: "token",
  identifier: "identifier",
  line: "line",
  sentence: "sentence",
  paragraph: "block",
  document: "file",
  nonWhitespaceSequence: "paint",
  boundedNonWhitespaceSequence: "short paint",
  url: "link",
  notebookCell: "cell",

  switchStatementSubject: null,
} as const satisfies Record<SimpleScopeTypeType, string | null>;

type ExtendedSurroundingPairName = SurroundingPairName | "whitespace";

const surroundingPairsSpoken: Record<
  ExtendedSurroundingPairName,
  string | null
> = {
  curlyBrackets: "curly",
  angleBrackets: "diamond",
  escapedDoubleQuotes: "escaped quad",
  escapedSingleQuotes: "escaped twin",
  escapedParentheses: "escaped round",
  escapedSquareBrackets: "escaped box",
  doubleQuotes: "quad",
  parentheses: "round",
  backtickQuotes: "skis",
  squareBrackets: "box",
  singleQuotes: "twin",
  any: "pair",
  string: "string",
  whitespace: "void",

  // Used internally by the "item" scope type
  collectionBoundary: null,
};

const surroundingPairsDelimiters: Record<
  ExtendedSurroundingPairName,
  [string, string] | null
> = {
  curlyBrackets: ["{", "}"],
  angleBrackets: ["<", ">"],
  escapedDoubleQuotes: ['\\"', '\\"'],
  escapedSingleQuotes: ["\\'", "\\'"],
  escapedParentheses: ["\\(", "\\)"],
  escapedSquareBrackets: ["\\[", "\\]"],
  doubleQuotes: ['"', '"'],
  parentheses: ["(", ")"],
  backtickQuotes: ["`", "`"],
  squareBrackets: ["[", "]"],
  singleQuotes: ["'", "'"],
  whitespace: [" ", " "],

  any: null,
  string: null,
  collectionBoundary: null,
};
const surroundingPairDelimiterToName = new CompositeKeyMap<
  [string, string],
  SurroundingPairName
>((pair) => pair);

for (const [name, pair] of Object.entries(surroundingPairsDelimiters)) {
  if (pair != null) {
    surroundingPairDelimiterToName.set(pair, name as SurroundingPairName);
  }
}

export const surroundingPairForceDirections = {
  left: "left",
  right: "right",
};

/**
 * Given a pair name (eg `parentheses`), returns the spoken form of the
 * surrounding pair.
 * @param surroundingPair The name of the surrounding pair
 * @returns The spoken form of the surrounding pair
 */
export function surroundingPairNameToSpokenForm(
  surroundingPair: SurroundingPairName,
): string {
  const result = surroundingPairsSpoken[surroundingPair];
  if (result == null) {
    throw Error(`Unknown surrounding pair '${surroundingPair}'`);
  }
  return result;
}

/**
 * Given a pair of delimiters, returns the spoken form of the surrounding pair.
 * First maps from the delimiters to their identifer (eg `parentheses`), then
 * looks it up in the spoken form map.
 * @param left The left delimiter
 * @param right The right delimiter
 * @returns The spoken form of the surrounding pair
 */
export function surroundingPairDelimitersToSpokenForm(
  left: string,
  right: string,
): string {
  const pairName = surroundingPairDelimiterToName.get([left, right]);
  if (pairName == null) {
    throw Error(`Unknown surrounding pair delimiters '${left} ${right}'`);
  }
  return surroundingPairNameToSpokenForm(pairName);
}
