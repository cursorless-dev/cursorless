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
  "value.assignment",
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
] as const;

const textualScopeSupportFacets = ["line", "paragraph"] as const;

export type ScopeSupportFacet = (typeof scopeSupportFacets)[number];
export type TextualScopeSupportFacet =
  (typeof textualScopeSupportFacets)[number];

export interface ScopeSupportFacetInfo {
  label: string;
  description: string;
  scopeType: SimpleScopeTypeType;
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
  ["value.assignment"]: {
    label: "Assignment value",
    description: "Value(RHS) of an assignment",
    scopeType: "value",
    examples: ["const foo = 1"],
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
};

export enum ScopeSupportFacetLevel {
  supported,
  unsupported,
  notApplicable,
}

export type LanguageScopeSupportFacetMap = Record<
  ScopeSupportFacet,
  ScopeSupportFacetLevel
>;

export type TextualLanguageScopeSupportFacetMap = Record<
  TextualScopeSupportFacet,
  ScopeSupportFacetLevel
>;
