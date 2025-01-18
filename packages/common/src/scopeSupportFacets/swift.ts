import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const swiftScopeSupport: LanguageScopeSupportFacetMap = {
  namedFunction: supported,
  "namedFunction.method": supported,
  "namedFunction.method.iteration.class": supported,
  "namedFunction.constructor": supported,
  "namedFunction.iteration": supported,
  "namedFunction.iteration.document": supported,
};