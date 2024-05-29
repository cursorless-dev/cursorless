/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const javaScopeSupport: LanguageScopeSupportFacetMap = {
  "name.foreach": supported,
  "value.foreach": supported,
  "type.foreach": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,
  "argument.actual": supported,
  "argument.actual.iteration": supported,

  element: notApplicable,
  tags: notApplicable,
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,
};
