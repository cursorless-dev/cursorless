import { SimpleScopeTypeType } from "../types/command/PartialTargetDescriptor.types";

const scopeSupportFacets = [
  "command",

  "element",
  "tags",
  "startTag",
  "endTag",
  "attribute",

  "environment",

  "list",
  "map",
  "ifStatement",
  "regularExpression",
  "switchStatementSubject",
  "fieldAccess",

  "statement",
  "statement.iteration.document",
  "statement.iteration.block",

  "class",
  "className",
  "namedFunction",
  "namedFunction.method",
  "anonymousFunction",
  "functionName",

  "functionCall",
  "functionCall.constructor",
  "functionCallee",
  "functionCallee.constructor",

  "argument.actual",
  "argument.actual.iteration",
  "argument.formal",
  "argument.formal.iteration",

  "comment.line",
  "comment.block",

  "string.singleLine",
  "string.multiLine",

  "branch.if",
  "branch.if.iteration",
  "branch.try",
  "branch.switchCase",
  "branch.switchCase.iteration",
  "branch.ternary",

  "condition.if",
  "condition.while",
  "condition.doWhile",
  "condition.for",
  "condition.ternary",
  "condition.switchCase",

  "name.assignment",
  "name.assignment.pattern",
  "name.variable",
  "name.variable.pattern",
  "name.foreach",
  "name.function",
  "name.class",
  "name.field",
  "name.resource",
  "name.resource.iteration",

  "key.attribute",
  "key.mapPair",
  "key.mapPair.iteration",

  "value.assignment",
  "value.variable",
  "value.mapPair",
  "value.mapPair.iteration",
  "value.attribute",
  "value.foreach",
  "value.return",
  "value.return.lambda",
  "value.field",
  "value.yield",
  "value.resource",
  "value.resource.iteration",

  "type.variable",
  "type.formalParameter",
  "type.return",
  "type.field",
  "type.foreach",
  "type.interface",
  "type.alias",
  "type.cast",

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
  supportedLegacy,
  unsupported,
  notApplicable,
}

export type ScopeSupportFacet = (typeof scopeSupportFacets)[number];

export type TextualScopeSupportFacet =
  (typeof textualScopeSupportFacets)[number];

export type LanguageScopeSupportFacetMap = Partial<
  Record<ScopeSupportFacet, ScopeSupportFacetLevel>
>;
