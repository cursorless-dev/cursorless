/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const haskellScopeSupport: LanguageScopeSupportFacetMap = {
  command: notApplicable,

  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  attribute: notApplicable,

  list: notApplicable,
  map: notApplicable,
  ifStatement: notApplicable,
  regularExpression: notApplicable,
  switchStatementSubject: notApplicable,
  fieldAccess: notApplicable,

  statement: notApplicable,
  "statement.iteration.document": notApplicable,
  "statement.iteration.block": notApplicable,

  class: notApplicable,
  className: notApplicable,
  namedFunction: notApplicable,
  "namedFunction.method": notApplicable,
  anonymousFunction: notApplicable,
  functionName: notApplicable,

  functionCall: notApplicable,
  "functionCall.constructor": notApplicable,
  functionCallee: notApplicable,
  "functionCallee.constructor": notApplicable,

  "argument.actual": notApplicable,
  "argument.actual.iteration": notApplicable,
  "argument.formal": notApplicable,
  "argument.formal.iteration": notApplicable,

  "comment.line": notApplicable,
  "comment.block": notApplicable,

  "string.singleLine": notApplicable,
  "string.multiLine": notApplicable,

  "branch.if": notApplicable,
  "branch.if.iteration": notApplicable,
  "branch.try": notApplicable,
  "branch.switchCase": notApplicable,
  "branch.switchCase.iteration": notApplicable,
  "branch.ternary": notApplicable,

  "condition.if": notApplicable,
  "condition.while": notApplicable,
  "condition.doWhile": notApplicable,
  "condition.for": notApplicable,
  "condition.ternary": notApplicable,
  "condition.switchCase": notApplicable,

  "name.assignment": notApplicable,
  "name.assignment.pattern": notApplicable,
  "name.foreach": notApplicable,
  "name.function": notApplicable,
  "name.class": notApplicable,
  "name.field": notApplicable,

  "key.attribute": notApplicable,
  "key.mapPair": notApplicable,
  "key.mapPair.iteration": notApplicable,

  "value.assignment": notApplicable,
  "value.mapPair": notApplicable,
  "value.mapPair.iteration": notApplicable,
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
