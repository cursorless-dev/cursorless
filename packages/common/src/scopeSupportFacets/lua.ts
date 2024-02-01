import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const luaScopeSupport: LanguageScopeSupportFacetMap = {
  "key.attribute": notApplicable,
  tags: notApplicable,
};
