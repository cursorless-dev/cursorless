/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const elixirScopeSupport: LanguageScopeSupportFacetMap = {
  "collectionItem.map": supported,
  "collectionItem.map.iteration": supported,
};
