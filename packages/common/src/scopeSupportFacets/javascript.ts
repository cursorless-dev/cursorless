import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const javascriptCoreScopeSupport: LanguageScopeSupportFacetMap = {
  list: supported,
  map: supported,
  regularExpression: supported,
  switchStatementSubject: supported,
  fieldAccess: supported,
  disqualifyDelimiter: supported,
  pairDelimiter: supported,

  "collectionItem.unenclosed": supported,
  "collectionItem.unenclosed.iteration": supported,

  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,
  "textFragment.comment.line": supported,
  "textFragment.comment.block": supported,

  ifStatement: supported,

  statement: supported,
  "statement.iteration.document": supported,
  "statement.iteration.block": supported,
  "statement.class": supported,

  class: supported,
  "class.iteration.document": supported,

  className: supported,
  "className.iteration.document": supported,

  anonymousFunction: supported,

  namedFunction: supported,
  "namedFunction.iteration.document": supported,
  "namedFunction.method": supported,
  "namedFunction.method.iteration.class": supported,
  "namedFunction.constructor": supported,

  functionName: supported,
  "functionName.iteration.document": supported,
  "functionName.method": supported,
  "functionName.method.iteration.class": supported,
  "functionName.constructor": supported,

  functionCall: supported,
  "functionCall.constructor": supported,
  functionCallee: supported,
  "functionCallee.constructor": supported,

  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.actual.method": supported,
  "argument.actual.method.iteration": supported,
  "argument.actual.constructor": supported,
  "argument.actual.constructor.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,
  "argument.formal.method": supported,
  "argument.formal.method.iteration": supported,
  "argument.formal.constructor": supported,
  "argument.formal.constructor.iteration": supported,
  "argument.formal.lambda": supported,
  "argument.formal.lambda.iteration": supported,

  "argumentList.actual.empty": supported,
  "argumentList.actual.singleLine": supported,
  "argumentList.actual.multiLine": supported,
  "argumentList.actual.method.empty": supported,
  "argumentList.actual.method.singleLine": supported,
  "argumentList.actual.method.multiLine": supported,
  "argumentList.actual.constructor.empty": supported,
  "argumentList.actual.constructor.singleLine": supported,
  "argumentList.actual.constructor.multiLine": supported,
  "argumentList.formal.empty": supported,
  "argumentList.formal.singleLine": supported,
  "argumentList.formal.multiLine": supported,
  "argumentList.formal.lambda.empty": supported,
  "argumentList.formal.lambda.singleLine": supported,
  "argumentList.formal.lambda.multiLine": supported,
  "argumentList.formal.method.empty": supported,
  "argumentList.formal.method.singleLine": supported,
  "argumentList.formal.method.multiLine": supported,
  "argumentList.formal.constructor.empty": supported,
  "argumentList.formal.constructor.singleLine": supported,
  "argumentList.formal.constructor.multiLine": supported,

  "comment.line": supported,
  "comment.block": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "branch.if": supported,
  "branch.if.iteration": supported,
  "branch.try": supported,
  "branch.try.iteration": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": supported,
  "branch.loop": supported,

  "condition.if": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.for": supported,
  "condition.ternary": supported,
  "condition.switchCase": supported,
  "condition.switchCase.iteration": supported,

  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.argument.formal.constructor": supported,
  "name.argument.formal.constructor.iteration": supported,
  "name.foreach": supported,
  "name.assignment": supported,
  "name.assignment.pattern": supported,
  "name.variable": supported,
  "name.variable.pattern": supported,
  "name.function": supported,
  "name.method": supported,
  "name.constructor": supported,
  "name.class": supported,
  "name.field": supported,
  "name.iteration.document": supported,
  "name.iteration.block": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "value.argument.formal": supported,
  "value.argument.formal.iteration": supported,
  "value.argument.formal.method": supported,
  "value.argument.formal.method.iteration": supported,
  "value.argument.formal.constructor": supported,
  "value.argument.formal.constructor.iteration": supported,
  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.assignment": supported,
  "value.variable": supported,
  "value.variable.pattern": supported,
  "value.foreach": supported,
  "value.return": supported,
  "value.return.lambda": supported,
  "value.field": supported,
  "value.yield": supported,

  "type.class": supported,

  "interior.class": supported,
  "interior.function": supported,
  "interior.if": supported,
  "interior.lambda": supported,
  "interior.loop": supported,
  "interior.switchCase": supported,
  "interior.ternary": supported,
  "interior.try": supported,

  /* NOT APPLICABLE (JS & TS) */

  // Nested the classes
  "class.iteration.block": notApplicable,
  "className.iteration.block": notApplicable,

  // Section
  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,

  // Command
  command: notApplicable,
  "interior.command": notApplicable,

  // Notebook cell
  notebookCell: notApplicable,
  "interior.cell": notApplicable,

  // Resource
  "interior.resource": notApplicable,
  "name.resource.iteration": notApplicable,
  "name.resource": notApplicable,
  "type.resource.iteration": notApplicable,
  "type.resource": notApplicable,
  "value.resource.iteration": notApplicable,
  "value.resource": notApplicable,

  // Keyword argument
  "name.argument.actual.iteration": notApplicable,
  "name.argument.actual": notApplicable,
  "value.argument.actual.iteration": notApplicable,
  "value.argument.actual": notApplicable,

  // Nested functions. Technically supported, but great problem with `every funk` in a method.
  "functionName.iteration.block": notApplicable,
  "namedFunction.iteration.block": notApplicable,

  // Miscellaneous
  environment: notApplicable,
};

export const javascriptJsxScopeSupport: LanguageScopeSupportFacetMap = {
  element: supported,
  tags: supported,
  startTag: supported,
  endTag: supported,
  attribute: supported,
  "key.attribute": supported,
  "value.attribute": supported,
  "interior.element": supported,
  "textFragment.element": supported,
};

export const javascriptScopeSupport: LanguageScopeSupportFacetMap = {
  ...javascriptCoreScopeSupport,
  ...javascriptJsxScopeSupport,

  // Types are defined here because we don't want typescript to import them and
  // accidentally forget to add support for them.

  "type.argument.formal": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "type.alias": notApplicable,
  "type.cast": notApplicable,
  "type.field": notApplicable,
  "type.field.iteration": notApplicable,
  "type.foreach": notApplicable,
  "type.interface": notApplicable,
  "type.enum": notApplicable,
  "type.return": notApplicable,
  "type.variable": notApplicable,
  "type.typeArgument": notApplicable,
  "type.typeArgument.iteration": notApplicable,

  "value.typeAlias": notApplicable,
};
