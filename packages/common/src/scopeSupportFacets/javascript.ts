/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const javascriptCoreScopeSupport: LanguageScopeSupportFacetMap = {
  list: supported,
  map: supported,
  ifStatement: supported,
  regularExpression: supported,
  switchStatementSubject: supported,
  fieldAccess: supported,

  statement: supported,
  "statement.iteration.document": supported,
  "statement.iteration.block": supported,

  class: supported,
  className: supported,

  namedFunction: supported,
  "namedFunction.method": supported,
  anonymousFunction: supported,
  functionName: supported,

  functionCall: supported,
  "functionCall.constructor": supported,
  functionCallee: supported,
  "functionCallee.constructor": supported,

  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,

  "comment.line": supported,
  "comment.block": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "branch.if": supported,
  "branch.if.iteration": supported,
  "branch.try": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": supported,

  "condition.if": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.for": supported,
  "condition.ternary": supported,
  "condition.switchCase": supported,

  "name.foreach": supported,
  "name.assignment": supported,
  "name.assignment.pattern": supported,
  "name.variable": supported,
  "name.variable.pattern": supported,
  "name.function": supported,
  "name.class": supported,
  "name.field": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.assignment": supported,
  "value.variable": supported,
  "value.foreach": supported,
  "value.return": supported,
  "value.return.lambda": supported,
  "value.field": supported,
};

export const javascriptJsxScopeSupport: LanguageScopeSupportFacetMap = {
  element: supported,
  tags: supported,
  startTag: supported,
  endTag: supported,
  attribute: supported,
  "key.attribute": supported,
  "value.attribute": supported,
};

export const javascriptScopeSupport: LanguageScopeSupportFacetMap = {
  ...javascriptCoreScopeSupport,
  ...javascriptJsxScopeSupport,

  "type.variable": notApplicable,
  "type.argument.formal": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "type.return": notApplicable,
  "type.field": notApplicable,
  "type.foreach": notApplicable,
  "type.interface": notApplicable,
  command: notApplicable,
};
