/* eslint-disable @typescript-eslint/naming-convention */

import { javascriptScopeSupport } from "./javascript";
import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const javascriptreactScopeSupport: LanguageScopeSupportFacetMap = {
  ...javascriptScopeSupport,
};
