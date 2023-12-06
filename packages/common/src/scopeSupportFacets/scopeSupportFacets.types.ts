import { SimpleScopeTypeType } from "../types/command/PartialTargetDescriptor.types";

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
  readonly label: string;
  readonly description: string;
  readonly scopeType: SimpleScopeTypeType;
  readonly isIteration?: boolean;
  readonly examples: readonly string[];
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
