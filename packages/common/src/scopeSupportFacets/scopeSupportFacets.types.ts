import { SimpleScopeTypeType } from "../types/command/PartialTargetDescriptor.types";

const scopeSupportFacets = [
  "command",

  "element",
  "tags",
  "startTag",
  "endTag",
  "attribute",

  "list",
  "map",
  "statement",
  "ifStatement",
  "regularExpression",
  "switchStatementSubject",
  "fieldAccess",

  "class",
  "className",
  "namedFunction",
  "namedFunction.method",
  "anonymousFunction",
  "anonymousFunction.lambda",
  "functionName",

  "functionCall",
  "functionCall.constructor",
  "functionCallee",
  "functionCallee.constructor",

  "argumentOrParameter.actual",
  "argumentOrParameter.formal",

  "comment.line",
  "comment.block",

  "string.singleLine",
  "string.multiLine",

  "branch.if",
  "branch.try",
  "branch.switchCase",

  "condition.if",
  "condition.while",
  "condition.doWhile",
  "condition.for",
  "condition.ternary",
  "condition.switchCase",

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

  // FIXME: Still in legacy
  // section
  // selector
  // unit
  // collectionItem
  // textFragment
] as const;

const textualScopeSupportFacets = [
  "character",
  "word",
  "token",
  "identifier",
  "line",
  "sentence",
  "paragraph",
  "document",
  "nonWhitespaceSequence",
  // FIXME: Still in legacy
  // "boundedNonWhitespaceSequence",
  "url",
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
