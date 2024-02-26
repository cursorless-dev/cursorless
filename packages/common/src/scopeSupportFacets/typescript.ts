/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const typescriptScopeSupport: LanguageScopeSupportFacetMap = {
  "type.variable": supported,
  "type.formalParameter": supported,
  "type.return": supported,
  "type.field": supported,
  "type.interface": supported,
  "type.alias": supported,
  "name.field": supported,
  "value.field": supported,
};
