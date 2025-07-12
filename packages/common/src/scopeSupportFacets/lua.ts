import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const luaScopeSupport: LanguageScopeSupportFacetMap = {
  tags: notApplicable,
  functionCall: supported,
  functionCallee: supported,
  map: supported,
  ifStatement: supported,
  namedFunction: supported,
  disqualifyDelimiter: supported,

  "key.attribute": notApplicable,

  "name.assignment": supported,
  "name.variable": supported,

  "value.assignment": supported,
  "value.variable": supported,

  "branch.if": supported,
  "branch.if.elif.else": supported,
  "branch.if.else": supported,
  "branch.if.iteration": supported,

  "condition.if": supported,

  "interior.function": supported,
  "interior.if": supported,
};
