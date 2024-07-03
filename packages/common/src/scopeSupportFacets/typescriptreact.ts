import { javascriptJsxScopeSupport } from "./javascript";
import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";
import { typescriptScopeSupport } from "./typescript";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const typescriptreactScopeSupport: LanguageScopeSupportFacetMap = {
  ...typescriptScopeSupport,
  ...javascriptJsxScopeSupport,
};
