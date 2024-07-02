import { javascriptCoreScopeSupport } from "./javascript";
import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const typescriptScopeSupport: LanguageScopeSupportFacetMap = {
  ...javascriptCoreScopeSupport,

  "name.field": supported,

  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.argument.formal.method": supported,
  "type.argument.formal.method.iteration": supported,
  "type.argument.formal.constructor": supported,
  "type.argument.formal.constructor.iteration": supported,
  "type.alias": supported,
  "type.cast": supported,
  "type.field": supported,
  "type.interface": supported,
  "type.return": supported,
  "type.variable": supported,

  "value.field": supported,
  "value.typeAlias": supported,
};
