import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const talonScopeSupport: LanguageScopeSupportFacetMap = {
  command: supported,
  "name.field": supported,
  "value.field": supported,
};
