/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const javascriptScopeSupport: LanguageScopeSupportFacetMap = {
  list: supported,
  map: supported,

  "comment.line": supported,
  "comment.block": supported,

  class: supported,
  className: supported,

  namedFunction: supported,
  "namedFunction.method": supported,
  anonymousFunction: supported,
  "anonymousFunction.lambda": supported,
  functionName: supported,

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
