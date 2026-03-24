import { jsonScopeSupport } from "./json";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";

export const jsoncScopeSupport: LanguageScopeSupportFacetMap = {
  ...jsonScopeSupport,
};
