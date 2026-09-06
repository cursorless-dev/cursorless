import { javascriptJsxScopeSupport } from "./javascript";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { typescriptScopeSupport } from "./typescript";

export const typescriptreactScopeSupport: LanguageScopeSupportFacetMap = {
  ...typescriptScopeSupport,
  ...javascriptJsxScopeSupport,
};
