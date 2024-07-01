import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const luaScopeSupport: LanguageScopeSupportFacetMap = {
  "key.attribute": notApplicable,
  tags: notApplicable,
  "name.assignment": supported,
  "name.variable": supported,
  "value.assignment": supported,
  "value.variable": supported,
  functionCallee: supported,
  map: supported,
  "branch.if": supported,
  namedFunction: supported,
};
