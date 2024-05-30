/* eslint-disable @typescript-eslint/naming-convention */

import { jsonScopeSupport } from "./json";
import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const jsonlScopeSupport: LanguageScopeSupportFacetMap = {
  ...jsonScopeSupport,
};
