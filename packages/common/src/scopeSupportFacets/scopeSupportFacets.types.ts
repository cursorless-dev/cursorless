import { SimpleScopeTypeType } from "../types/command/PartialTargetDescriptor.types";

const scopeSupportFacets = [
  "tags",
  "element",
  "attribute",

  "list",
  "map",

  "ifStatement",

  "functionCall",
  "functionCall.constructor",
  "functionCallee",
  "functionCallee.constructor",

  "class",
  "className",
  "namedFunction",
  "namedFunction.method",
  "anonymousFunction",
  "anonymousFunction.lambda",
  "functionName",

  "comment.line",
  "comment.block",

  "condition.if",
  "condition.while",
  "condition.doWhile",
  "condition.for",
  "condition.ternary",
  "condition.switch",

  "name.assignment",
  "name.foreach",

  "key.attribute",
  "key.mapPair",
  "key.mapPair.iteration",

  "value.assignment",
  "value.mapPair",
  "value.mapPair.iteration",
  "value.attribute",
  "value.foreach",
  "value.return",
  "value.return.lambda",

  "type.foreach",

  //   "statement",

  //   "branch",
  //   "string.singleLine",
  //   "string.multiLine",
  //   "textFragment",
  //   "argumentOrParameter.argument",
  //   "argumentOrParameter.parameter",
] as const;

const textualScopeSupportFacets = [
  "character",
  "word",
  "token",
  "line",
  "paragraph",
  "document",
] as const;

export interface ScopeSupportFacetInfo {
  readonly description: string;
  readonly scopeType: SimpleScopeTypeType;
  readonly isIteration?: boolean;
}

export enum ScopeSupportFacetLevel {
  supported,
  unsupported,
  notApplicable,
}

export type ScopeSupportFacet = (typeof scopeSupportFacets)[number];

export type TextualScopeSupportFacet =
  (typeof textualScopeSupportFacets)[number];

export type LanguageScopeSupportFacetMap = Partial<
  Record<ScopeSupportFacet, ScopeSupportFacetLevel>
>;
