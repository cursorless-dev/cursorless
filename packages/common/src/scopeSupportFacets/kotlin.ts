import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const kotlinScopeSupport: LanguageScopeSupportFacetMap = {
  /* UNSUPPORTED  */

  fieldAccess: unsupported,

  /* NOT APPLICABLE */
};
