/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const typescriptScopeSupport: LanguageScopeSupportFacetMap = {
  "type.assignment": supported,
  "type.formalParameter": supported,
  "type.return": supported,
  "type.field": supported,
  "type.interface": supported,
};
