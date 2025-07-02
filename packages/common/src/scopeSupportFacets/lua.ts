import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

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
  "branch.if.elif.else": supported,
  "branch.if.else": supported,
  "branch.if.iteration": supported,
  namedFunction: supported,
  disqualifyDelimiter: supported,
  "interior.function": supported,
  "interior.if": supported,
};
