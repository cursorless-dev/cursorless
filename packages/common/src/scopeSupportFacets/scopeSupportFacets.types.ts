import type { SimpleScopeTypeType } from "../types/command/PartialTargetDescriptor.types";
import { type ScopeType } from "../types/command/PartialTargetDescriptor.types";

export const scopeSupportFacets = [
  "command",
  "environment",
  "notebookCell",
  "regularExpression",
  "switchStatementSubject",
  "fieldAccess",

  "element",
  "tags",
  "startTag",
  "endTag",
  "attribute",

  "section",
  "section.iteration.document",
  "section.iteration.parent",

  "selector",
  "unit",

  "list",
  "map",

  "ifStatement",

  "statement",
  "statement.class",
  "statement.interface",
  "statement.enum",
  "statement.field.class",
  "statement.field.interface",
  "statement.iteration.document",
  "statement.iteration.class",
  "statement.iteration.interface",
  "statement.iteration.block",

  "class",
  "class.iteration.document",
  "class.iteration.block",

  "className",
  "className.iteration.document",
  "className.iteration.block",

  "anonymousFunction",

  "namedFunction",
  "namedFunction.iteration.block",
  "namedFunction.iteration.document",
  "namedFunction.method",
  "namedFunction.method.iteration.class",
  "namedFunction.constructor",

  "functionName",
  "functionName.iteration.block",
  "functionName.iteration.document",
  "functionName.method",
  "functionName.method.iteration.class",
  "functionName.constructor",

  "functionCall",
  "functionCall.constructor",
  "functionCallee",
  "functionCallee.constructor",

  "argument.actual.singleLine",
  "argument.actual.multiLine",
  "argument.actual.iteration",
  "argument.actual.method.singleLine",
  "argument.actual.method.multiLine",
  "argument.actual.method.iteration",
  "argument.actual.constructor.singleLine",
  "argument.actual.constructor.multiLine",
  "argument.actual.constructor.iteration",

  "argument.formal.singleLine",
  "argument.formal.multiLine",
  "argument.formal.iteration",
  "argument.formal.method.singleLine",
  "argument.formal.method.multiLine",
  "argument.formal.method.iteration",
  "argument.formal.constructor.singleLine",
  "argument.formal.constructor.multiLine",
  "argument.formal.constructor.iteration",
  "argument.formal.lambda.singleLine",
  "argument.formal.lambda.multiLine",
  "argument.formal.lambda.iteration",
  "argument.catch",

  "argumentList.actual.empty",
  "argumentList.actual.singleLine",
  "argumentList.actual.multiLine",
  "argumentList.actual.method.empty",
  "argumentList.actual.method.singleLine",
  "argumentList.actual.method.multiLine",
  "argumentList.actual.constructor.empty",
  "argumentList.actual.constructor.singleLine",
  "argumentList.actual.constructor.multiLine",

  "argumentList.formal.empty",
  "argumentList.formal.singleLine",
  "argumentList.formal.multiLine",
  "argumentList.formal.method.empty",
  "argumentList.formal.method.singleLine",
  "argumentList.formal.method.multiLine",
  "argumentList.formal.constructor.empty",
  "argumentList.formal.constructor.singleLine",
  "argumentList.formal.constructor.multiLine",
  "argumentList.formal.lambda.empty",
  "argumentList.formal.lambda.singleLine",
  "argumentList.formal.lambda.multiLine",

  "comment.line",
  "comment.block",

  "string.singleLine",
  "string.multiLine",

  "textFragment.comment.line",
  "textFragment.comment.block",
  "textFragment.string.singleLine",
  "textFragment.string.multiLine",
  "textFragment.element",

  "disqualifyDelimiter",
  "pairDelimiter",

  "branch.if",
  "branch.if.elif.else",
  "branch.if.else",
  "branch.if.iteration",
  "branch.try",
  "branch.try.iteration",
  "branch.switchCase",
  "branch.switchCase.iteration",
  "branch.ternary",
  "branch.ternary.iteration",
  "branch.loop",
  "branch.loop.iteration",

  "collectionItem.unenclosed",
  "collectionItem.unenclosed.iteration",

  "condition.if",
  "condition.while",
  "condition.doWhile",
  "condition.for",
  "condition.ternary",
  "condition.switchCase",
  "condition.switchCase.iteration",

  "name.assignment",
  "name.assignment.pattern",
  "name.command",
  "name.variable",
  "name.variable.pattern",
  "name.foreach",
  "name.function",
  "name.method",
  "name.constructor",
  "name.class",
  "name.interface",
  "name.enum",
  "name.namespace",
  "name.field.class",
  "name.field.interface",
  "name.field.enum",
  "name.resource",
  "name.resource.iteration",
  "name.argument.actual",
  "name.argument.actual.iteration",
  "name.argument.formal",
  "name.argument.formal.iteration",
  "name.argument.formal.method",
  "name.argument.formal.method.iteration",
  "name.argument.formal.constructor",
  "name.argument.formal.constructor.iteration",
  "name.argument.catch",
  "name.iteration.block",
  "name.iteration.class",
  "name.iteration.interface",
  "name.iteration.enum",
  "name.iteration.document",

  "key.attribute",
  "key.mapPair",
  "key.mapPair.iteration",

  "value.assignment",
  "value.command",
  "value.variable",
  "value.variable.pattern",
  "value.mapPair",
  "value.mapPair.iteration",
  "value.attribute",
  "value.foreach",
  "value.return",
  "value.return.lambda",
  "value.field.class",
  "value.field.enum",
  "value.yield",
  "value.typeAlias",
  "value.resource",
  "value.resource.iteration",
  "value.argument.actual",
  "value.argument.actual.iteration",
  "value.argument.formal",
  "value.argument.formal.iteration",
  "value.argument.formal.method",
  "value.argument.formal.method.iteration",
  "value.argument.formal.constructor",
  "value.argument.formal.constructor.iteration",
  "value.iteration.block",
  "value.iteration.class",
  "value.iteration.enum",
  "value.iteration.document",

  "type.variable",
  "type.return",
  "type.field.class",
  "type.field.interface",
  "type.foreach",
  "type.alias",
  "type.cast",
  "type.class",
  "type.interface",
  "type.enum",
  "type.resource",
  "type.resource.iteration",
  "type.typeArgument",
  "type.typeArgument.iteration",
  "type.argument.formal",
  "type.argument.formal.iteration",
  "type.argument.formal.method",
  "type.argument.formal.method.iteration",
  "type.argument.formal.constructor",
  "type.argument.formal.constructor.iteration",
  "type.argument.catch",
  "type.iteration.block",
  "type.iteration.class",
  "type.iteration.interface",
  "type.iteration.document",

  "interior.class",
  "interior.interface",
  "interior.enum",
  "interior.function",
  "interior.constructor",
  "interior.method",
  "interior.lambda.block",
  "interior.lambda.expression",
  "interior.element",
  "interior.command",
  "interior.cell",
  "interior.if",
  "interior.try",
  "interior.switch",
  "interior.switchCase",
  "interior.ternary",
  "interior.for",
  "interior.foreach",
  "interior.while",
  "interior.doWhile",
  "interior.resource",
  "interior.namespace",
  "interior.static",
] as const;

export interface ScopeSupportFacetInfo {
  readonly description: string;
  readonly scopeType: SimpleScopeTypeType | ScopeType;
  readonly isIteration?: boolean;
}

export enum ScopeSupportFacetLevel {
  supported,
  unsupported,
  notApplicable,
}

export type ScopeSupportFacet = (typeof scopeSupportFacets)[number];

export type PlaintextScopeSupportFacet =
  | "character"
  | "word"
  | "token"
  | "identifier"
  | "line"
  | "sentence"
  | "paragraph"
  | "boundedParagraph"
  | "boundedParagraph.iteration"
  | "document"
  | "nonWhitespaceSequence"
  | "boundedNonWhitespaceSequence"
  | "boundedNonWhitespaceSequence.iteration"
  | "url"
  | "surroundingPair"
  | "surroundingPair.iteration"
  | "interior.surroundingPair"
  | "collectionItem.textual"
  | "collectionItem.textual.iteration";

export type LanguageScopeSupportFacetMap = Partial<
  Record<ScopeSupportFacet, ScopeSupportFacetLevel>
>;
