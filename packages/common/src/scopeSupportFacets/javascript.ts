/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, supportedLegacy, notApplicable } = ScopeSupportFacetLevel;

export const javascriptScopeSupport: LanguageScopeSupportFacetMap = {
  list: supported,
  map: supported,
  statement: supported,
  ifStatement: supported,
  regularExpression: supported,
  switchStatementSubject: supported,
  fieldAccess: supported,

  class: supported,
  className: supported,

  namedFunction: supported,
  "namedFunction.method": supported,
  anonymousFunction: supported,
  "anonymousFunction.lambda": supported,
  functionName: supported,

  functionCall: supported,
  "functionCall.constructor": supported,
  functionCallee: supported,
  "functionCallee.constructor": supported,

  "argumentOrParameter.actual": supportedLegacy,
  "argumentOrParameter.actual.iteration": supportedLegacy,
  "argumentOrParameter.formal": supportedLegacy,
  "argumentOrParameter.formal.iteration": supportedLegacy,

  "comment.line": supported,
  "comment.block": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "branch.if": supported,
  "branch.try": supported,
  "branch.switchCase": supported,

  "condition.if": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.for": supported,
  "condition.ternary": supported,
  "condition.switchCase": supported,

  "name.foreach": supported,
  "name.assignment": supported,
  "name.function": supported,
  "name.class": supported,
  "name.field": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.assignment": supported,
  "value.foreach": supported,
  "value.return": supported,
  "value.return.lambda": supported,
  "value.field": supported,

  element: supported,
  tags: supported,
  startTag: supported,
  endTag: supported,
  attribute: supported,
  "key.attribute": supported,
  "value.attribute": supported,

  "type.assignment": notApplicable,
  "type.formalParameter": notApplicable,
  "type.return": notApplicable,
  "type.field": notApplicable,
  "type.foreach": notApplicable,
  "type.interface": notApplicable,
  command: notApplicable,
};
