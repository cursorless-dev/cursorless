/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const pythonScopeSupport: LanguageScopeSupportFacetMap = {
  // namedFunction: supported,
  //"name.assignment": supported,
  "name.foreach": supported,
  //"key.mapPair": supported,
  //"key.mapPair.iteration": supported,
  //"value.mapPair": supported,
  //"value.mapPair.iteration": supported,
  //"value.assignment": supported,
  "value.foreach": supported,

  element: notApplicable,
  tags: notApplicable,
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,
};
