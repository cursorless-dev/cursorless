/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const shellscriptScopeSupport: LanguageScopeSupportFacetMap = {
  command: supported,
  "name.assignment": supported,
  "value.assignment": supported,
};
