import { SimpleScopeTypeType } from "../types/command/PartialTargetDescriptor.types";

const scopeSupportFacets = [
  //   "list",
  //   "list.interior",
  //   "map",
  //   "map.interior",
  //   "collectionKey",
  "element",
  "attribute",
  "namedFunction",
  //   "functionName",
  //   "anonymousFunction",

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
  //   "value.return",
  //   "value.collectionItem",

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
  //   "argumentOrParameter.parameter",
  //   "class",
  //   "class.interior",
  //   "className",

  "type.foreach",

  "tags",
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
