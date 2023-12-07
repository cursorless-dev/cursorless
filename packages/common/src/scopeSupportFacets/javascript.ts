/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const javascriptScopeSupport: LanguageScopeSupportFacetMap = {
  list: supported,
  map: supported,

  ifStatement: supported,

  functionCall: supported,
  "functionCall.constructor": supported,
  functionCallee: supported,
  "functionCallee.constructor": supported,

  class: supported,
  className: supported,

  namedFunction: supported,
  "namedFunction.method": supported,
  anonymousFunction: supported,
  "anonymousFunction.lambda": supported,
  functionName: supported,

  "comment.line": supported,
  "comment.block": supported,

  "condition.if": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.for": supported,
  "condition.ternary": supported,
  "condition.switch": supported,

  "name.foreach": supported,
  "name.assignment": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.assignment": supported,
  "value.foreach": supported,
  "value.return": supported,
  "value.return.lambda": supported,
};
