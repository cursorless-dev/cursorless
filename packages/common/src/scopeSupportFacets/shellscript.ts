/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const shellscriptScopeSupport: LanguageScopeSupportFacetMap = {
  list: supported,
  command: supported,
  "name.assignment": supported,
  "value.assignment": supported,
};
