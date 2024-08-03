import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const jsonScopeSupport: LanguageScopeSupportFacetMap = {
  "comment.line": supported,
  "comment.block": supported,
  map: supported,
};
