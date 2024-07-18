import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const talonScopeSupport: LanguageScopeSupportFacetMap = {
  command: supported,
};
