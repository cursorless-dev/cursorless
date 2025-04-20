import { javascriptCoreScopeSupport } from "./javascript";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const typescriptScopeSupport: LanguageScopeSupportFacetMap = {
  ...javascriptCoreScopeSupport,

  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.argument.formal.method": supported,
  "type.argument.formal.method.iteration": supported,
  "type.argument.formal.constructor": supported,
  "type.argument.formal.constructor.iteration": supported,
  "type.alias": supported,
  "type.cast": supported,
  "type.field": supported,
  "type.field.iteration": supported,
  "type.interface": supported,
  "type.enum": supported,
  "type.return": supported,
  "type.variable": supported,

  "value.typeAlias": supported,

  // Unsupported

  "type.typeArgument": unsupported,
  "type.typeArgument.iteration": unsupported,

  // Not applicable

  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,
  "type.foreach": notApplicable,
  "interior.element": notApplicable,
};
