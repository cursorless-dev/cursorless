/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const haskellScopeSupport: LanguageScopeSupportFacetMap = {
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
  // "class.instance": unsupported,
  className: unsupported,

  namedFunction: supported,
  "namedFunction.method": unsupported,
  anonymousFunction: unsupported,
  functionName: supported,

  functionCall: unsupported,
  "functionCall.constructor": unsupported,
  functionCallee: unsupported,
  "functionCallee.constructor": unsupported,

  "argument.actual": unsupported,
  "argument.actual.iteration": unsupported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,

  "comment.line": unsupported,
  "comment.block": unsupported,

  "string.singleLine": unsupported,

  "branch.match": supported,
  "branch.match.iteration": supported,
  "branch.if": unsupported,
  "branch.if.iteration": unsupported,
  "branch.ternary": unsupported,

  "condition.if": unsupported,
  "condition.ternary": unsupported,

  "name.assignment": unsupported,
  "name.assignment.pattern": unsupported,
  "name.function": supported,
  "name.class": unsupported,
  "name.field": unsupported,

  "key.mapPair": unsupported,
  "key.mapPair.iteration": unsupported,

  "value.assignment": unsupported,
  "value.mapPair": unsupported,
  "value.mapPair.iteration": unsupported,
  "value.return": unsupported,
  "value.return.lambda": unsupported,
  "value.field": unsupported,

  // "type.adt": unsupported,
  // "type.alias": unsupported,
  // "type.annotation": unsupported,
  // "type.constraint": unsupported,
  // "type.dataFamily": unsupported,
  // "type.dataInstance": unsupported,
  // "type.field": unsupported,
  // "type.foreignExport": unsupported,
  // "type.foreignImport": unsupported,
  "type.formalParameter": unsupported,
  // "type.function": unsupported,
  // "type.gadt": unsupported,
  // "type.newtype": unsupported,
  // "type.typeFamily": unsupported,
  // "type.typeInstance": unsupported,
};
