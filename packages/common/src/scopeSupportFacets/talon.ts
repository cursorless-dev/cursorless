import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const talonScopeSupport: LanguageScopeSupportFacetMap = {
  command: supported,

  "comment.line": supported,
  "comment.block": supported,
};
