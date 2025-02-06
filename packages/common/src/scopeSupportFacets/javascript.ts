import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const javascriptCoreScopeSupport: LanguageScopeSupportFacetMap = {
  list: supported,
  map: supported,
  regularExpression: supported,
  switchStatementSubject: supported,
  fieldAccess: supported,
  disqualifyDelimiter: supported,
  pairDelimiter: supported,

  "collectionItem.unenclosed": supported,

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
  className: supported,

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

  // Unsupported

  "collectionItem.unenclosed.iteration": unsupported,
  "branch.loop": unsupported,
  "namedFunction.iteration.block": unsupported,
  "functionName.iteration.block": unsupported,

  "class.iteration.block": unsupported,
  "class.iteration.document": unsupported,
  "className.iteration.block": unsupported,
  "className.iteration.document": unsupported,

  "name.iteration.block": unsupported,
  "name.resource": unsupported,
  "name.resource.iteration": unsupported,

  "value.resource": unsupported,
  "value.resource.iteration": unsupported,

  "interior.class": unsupported,
  "interior.function": unsupported,
  "interior.if": unsupported,
  "interior.lambda": unsupported,
  "interior.loop": unsupported,
  "interior.switchCase": unsupported,
  "interior.ternary": unsupported,
  "interior.try": unsupported,
  "interior.resource": unsupported,

  // Not applicable

  "interior.cell": notApplicable,
  "interior.command": notApplicable,
  "name.argument.actual.iteration": notApplicable,
  "name.argument.actual": notApplicable,
  "value.argument.actual": notApplicable,
  "value.argument.actual.iteration": notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,
  "textFragment.element": notApplicable,
  command: notApplicable,
  environment: notApplicable,
  notebookCell: notApplicable,
  section: notApplicable,
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
};

export const javascriptScopeSupport: LanguageScopeSupportFacetMap = {
  ...javascriptCoreScopeSupport,
  ...javascriptJsxScopeSupport,

  // Types are defined here because we don't want typescript to import them and
  // accidentally forget to add support for them.
  "value.typeAlias": notApplicable,
  "type.alias": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal": notApplicable,
  "type.cast": notApplicable,
  "type.class": notApplicable,
  "type.enum": notApplicable,
  "type.field.iteration": notApplicable,
  "type.field": notApplicable,
  "type.foreach": notApplicable,
  "type.interface": notApplicable,
  "type.return": notApplicable,
  "type.typeArgument.iteration": notApplicable,
  "type.typeArgument": notApplicable,
  "type.variable": notApplicable,
};
