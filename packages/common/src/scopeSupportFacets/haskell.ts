/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const haskellScopeSupport: LanguageScopeSupportFacetMap = {
  command: notApplicable,

  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  attribute: notApplicable,

  list: unsupported,
  map: unsupported,
  ifStatement: unsupported,
  regularExpression: unsupported,
  switchStatementSubject: unsupported,
  fieldAccess: unsupported,

  statement: unsupported,
  "statement.iteration.document": unsupported,
  "statement.iteration.block": unsupported,

  class: unsupported,
  className: unsupported,
  namedFunction: supported,
  "namedFunction.method": unsupported,
  anonymousFunction: unsupported,
  functionName: supported,

  functionCall: unsupported,
  "functionCall.constructor": unsupported,
  functionCallee: unsupported,
  "functionCallee.constructor": unsupported,

  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.formal": unsupported,
  "argument.formal.iteration": unsupported,

  "comment.line": unsupported,
  "comment.block": unsupported,

  "string.singleLine": unsupported,
  "string.multiLine": notApplicable,

  "branch.match": supported,
  "branch.match.iteration": supported,
  "branch.if": unsupported,
  "branch.if.iteration": unsupported,
  "branch.try": notApplicable,
  "branch.switchCase": notApplicable,
  "branch.switchCase.iteration": notApplicable,
  "branch.ternary": notApplicable,

  "condition.if": unsupported,
  "condition.while": notApplicable,
  "condition.doWhile": notApplicable,
  "condition.for": notApplicable,
  "condition.ternary": notApplicable,
  "condition.switchCase": notApplicable,

  "name.assignment": unsupported,
  "name.assignment.pattern": unsupported,
  "name.foreach": notApplicable,
  "name.function": supported,
  "name.class": unsupported,
  "name.field": unsupported,

  "key.attribute": notApplicable,
  "key.mapPair": notApplicable,
  "key.mapPair.iteration": notApplicable,

  "value.assignment": unsupported,
  "value.mapPair": unsupported,
  "value.mapPair.iteration": unsupported,
  "value.attribute": notApplicable,
  "value.foreach": notApplicable,
  "value.return": notApplicable,
  "value.return.lambda": notApplicable,
  "value.field": notApplicable,

  "type.assignment": notApplicable,
  "type.formalParameter": notApplicable,
  "type.return": notApplicable,
  "type.field": notApplicable,
  "type.foreach": notApplicable,
  "type.interface": notApplicable,
};
