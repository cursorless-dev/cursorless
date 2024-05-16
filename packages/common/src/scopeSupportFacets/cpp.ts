/* eslint-disable @typescript-eslint/naming-convention */

// import { cScopeSupport } from "./c";
import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const cppScopeSupport: LanguageScopeSupportFacetMap = {
  // ...cScopeSupport,
  ifStatement: supported,
};
