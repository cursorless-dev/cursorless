import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { unsupported } = ScopeSupportFacetLevel;

export const kotlinScopeSupport: LanguageScopeSupportFacetMap = {
  /* UNSUPPORTED  */

  fieldAccess: unsupported,

  /* NOT APPLICABLE */
};
