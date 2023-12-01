import { SimpleScopeTypeType } from "..";

const scopeSupportFacets = [
  //   "list",
  //   "list.interior",
  //   "map",
  //   "map.interior",
  //   "collectionKey",
  "namedFunction",
  //   "namedFunction.interior",
  //   "functionName",
  //   "anonymousFunction",
  //   "anonymousFunction.interior",
  "name.assignment",
  "key.attribute",
  "key.mapPair",
  "key.mapPair.iteration",
  "value.assignment",
  "value.mapPair",
  "value.mapPair.iteration",
  //   "value.assignment.removal",
  //   "value.return",
  //   "value.return.removal",
  //   "value.collectionItem",
  //   "value.collectionItem.removal",
  //   "statement",
  //   "ifStatement",
  //   "condition.if",
  //   "condition.while",
  //   "condition.doWhile",
  //   "condition.for",
  //   "condition.ternary",
  //   "branch",
  //   "comment.line",
  //   "comment.block",
  //   "string.singleLine",
  //   "string.multiLine",
  //   "textFragment",
  //   "functionCall",
  //   "functionCallee",
  //   "argumentOrParameter.argument",
  //   "argumentOrParameter.argument.removal",
  //   "argumentOrParameter.parameter",
  //   "argumentOrParameter.parameter.removal",
  //   "class",
  //   "class.interior",
  //   "className",
  //   "type",
  "tags.element",
] as const;

const textualScopeSupportFacets = [
  "character",
  "word",
  "token",
  "line",
  "paragraph",
  "document",
] as const;

export type ScopeSupportFacet = (typeof scopeSupportFacets)[number];
export type TextualScopeSupportFacet =
  (typeof textualScopeSupportFacets)[number];

export interface ScopeSupportFacetInfo {
  label: string;
  description: string;
  scopeType: SimpleScopeTypeType;
  isIteration?: boolean;
  examples: string[];
}

export const scopeSupportFacetInfos: Record<
  ScopeSupportFacet,
  ScopeSupportFacetInfo
> = {
  namedFunction: {
    label: "Named function",
    description: "A named function",
    scopeType: "namedFunction",
    examples: ["function foo() {}", "const foo = () => {}"],
  },
  ["name.assignment"]: {
    label: "Assignment name",
    description: "Name(LHS) of an assignment",
    scopeType: "name",
    examples: ["const foo = 1"],
  },
  ["key.attribute"]: {
    label: "Attributes key",
    description: "Key(LHS) of an attribute",
    scopeType: "collectionKey",
    examples: ['id="root"'],
  },
  ["key.mapPair"]: {
    label: "Map key",
    description: "Key(LHS) of a map pair",
    scopeType: "collectionKey",
    examples: ["value: 0"],
  },
  ["key.mapPair.iteration"]: {
    label: "Map pair key iteration",
    description: "Iteration of map pair keys",
    scopeType: "collectionKey",
    isIteration: true,
    examples: ["{ value: 0 }"],
  },
  ["value.assignment"]: {
    label: "Assignment value",
    description: "Value(RHS) of an assignment",
    scopeType: "value",
    examples: ["const foo = 1"],
  },
  ["value.mapPair"]: {
    label: "Map pair value",
    description: "Key(RHS) of a map pair",
    scopeType: "value",
    examples: ["value: 0"],
  },
  ["value.mapPair.iteration"]: {
    label: "Map pair value iteration",
    description: "Iteration of map pair values",
    scopeType: "value",
    isIteration: true,
    examples: ["{ value: 0 }"],
  },
  ["tags.element"]: {
    label: "Tags",
    description: "Both tags in an xml element",
    scopeType: "xmlBothTags",
    examples: ["<div></div>"],
  },
  // list: {
  //   label: "List",
  //   description: "A list of items",
  //   scopeType: "list",
  // },
  // "list.interior": {
  //   label: "List interior",
  //   description: "Excludes the opening and closing delimiters of the list",
  //   scopeType: "list",
  // },
  // map: {
  //   label: "Map",
  //   description: "A map of key-value pairs",
  //   scopeType: "map",
  // },
  // "map.interior": {
  //   label: "Map interior",
  //   description: "Excludes the opening and closing delimiters of the map",
  //   scopeType: "map",
  // },
};

export const textualScopeSupportFacetInfos: Record<
  TextualScopeSupportFacet,
  ScopeSupportFacetInfo
> = {
  character: {
    label: "Character",
    description: "A single character in the document",
    scopeType: "character",
    examples: ["a", "."],
  },
  word: {
    label: "Word",
    description: "A single word in a token",
    scopeType: "word",
    examples: ["foo_bar", "fooBar"],
  },
  token: {
    label: "Token",
    description: "A single token in the document",
    scopeType: "token",
    examples: ["foo", "("],
  },
  line: {
    label: "Line",
    description: "A single line in the document",
    scopeType: "line",
    examples: ["foo"],
  },
  paragraph: {
    label: "Paragraph",
    description:
      "A single paragraph(contiguous block of lines) in the document",
    scopeType: "paragraph",
    examples: ["foo\nbar"],
  },
  document: {
    label: "Documents",
    description: "The entire document",
    scopeType: "document",
    examples: ["foo\n\nbar"],
  },
};

export enum ScopeSupportFacetLevel {
  supported,
  unsupported,
  notApplicable,
}

export type LanguageScopeSupportFacetMap = Partial<
  Record<ScopeSupportFacet, ScopeSupportFacetLevel>
>;

export type TextualLanguageScopeSupportFacetMap = Record<
  TextualScopeSupportFacet,
  ScopeSupportFacetLevel
>;
