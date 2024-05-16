/* eslint-disable @typescript-eslint/naming-convention */

import { cssScopeSupport } from "./css";
import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const scssScopeSupport: LanguageScopeSupportFacetMap = {
  ...cssScopeSupport,
};
