import type { SimpleScopeTypeType } from "../types/command/PartialTargetDescriptor.types";
import { type ScopeType } from "../types/command/PartialTargetDescriptor.types";

export const scopeSupportFacets = [
  "command",

  "element",
  "tags",
  "startTag",
  "endTag",
  "attribute",

  "environment",

  "section",
  "section.iteration.document",
  "section.iteration.parent",

  "list",
  "map",
  "ifStatement",
  "regularExpression",
  "switchStatementSubject",
  "fieldAccess",

  "statement",
  "statement.class",
  "statement.iteration.document",
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

  "argument.actual",
  "argument.actual.iteration",
  "argument.actual.method",
  "argument.actual.method.iteration",
  "argument.actual.constructor",
  "argument.actual.constructor.iteration",

  "argument.formal",
  "argument.formal.iteration",
  "argument.formal.method",
  "argument.formal.method.iteration",
  "argument.formal.constructor",
  "argument.formal.constructor.iteration",
  "argument.formal.lambda",
  "argument.formal.lambda.iteration",

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
  "argumentList.formal.lambda.empty",
  "argumentList.formal.lambda.singleLine",
  "argumentList.formal.lambda.multiLine",
  "argumentList.formal.method.empty",
  "argumentList.formal.method.singleLine",
  "argumentList.formal.method.multiLine",
  "argumentList.formal.constructor.empty",
  "argumentList.formal.constructor.singleLine",
  "argumentList.formal.constructor.multiLine",

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
  "name.variable",
  "name.variable.pattern",
  "name.foreach",
  "name.function",
  "name.method",
  "name.constructor",
  "name.class",
  "name.field",
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
  "name.iteration.block",
  "name.iteration.document",

  "key.attribute",
  "key.mapPair",
  "key.mapPair.iteration",

  "value.assignment",
  "value.variable",
  "value.variable.pattern",
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
  "value.argument.actual",
  "value.argument.actual.iteration",
  "value.argument.formal",
  "value.argument.formal.iteration",
  "value.argument.formal.method",
  "value.argument.formal.method.iteration",
  "value.argument.formal.constructor",
  "value.argument.formal.constructor.iteration",
  "value.typeAlias",

  "type.variable",
  "type.argument.formal",
  "type.argument.formal.iteration",
  "type.argument.formal.method",
  "type.argument.formal.method.iteration",
  "type.argument.formal.constructor",
  "type.argument.formal.constructor.iteration",
  "type.return",
  "type.field",
  "type.field.iteration",
  "type.foreach",
  "type.interface",
  "type.enum",
  "type.alias",
  "type.cast",
  "type.class",
  "type.typeArgument",
  "type.typeArgument.iteration",
  "type.resource",
  "type.resource.iteration",

  "interior.class",
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

  "notebookCell",
  "selector",
  "unit",
] as const;

export interface ScopeSupportFacetInfo {
  readonly description: string;
  readonly scopeType: SimpleScopeTypeType | ScopeType;
  readonly isIteration?: boolean;
  readonly domainHint?: string;
  readonly removalHint?: string;
  readonly insertionDelimiterHint?: string;
}

export enum ScopeSupportFacetLevel {
  supported,
  unsupported,
  notApplicable,
}

export type ScopeSupportFacet = (typeof scopeSupportFacets)[number];

export type TextualScopeSupportFacet =
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
