import { javascriptCoreScopeSupport } from "./javascript";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const typescriptScopeSupport: LanguageScopeSupportFacetMap = {
  ...javascriptCoreScopeSupport,

  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.argument.formal.method": supported,
  "type.argument.formal.method.iteration": supported,
  "type.argument.formal.constructor": supported,
  "type.argument.formal.constructor.iteration": supported,
  "type.argument.catch": supported,
  "type.alias": supported,
  "type.cast": supported,
  "type.class": supported,
  "type.field.class": supported,
  "type.field.interface": supported,
  "type.interface": supported,
  "type.enum": supported,
  "type.return": supported,
  "type.variable": supported,
  "type.typeArgument": supported,
  "type.typeArgument.iteration": supported,
  "type.iteration.block": supported,
  "type.iteration.class": supported,
  "type.iteration.interface": supported,
  "type.iteration.document": supported,

  "name.interface": supported,
  "name.enum": supported,
  "name.field.interface": supported,
  "name.field.enum": supported,
  "name.iteration.interface": supported,
  "name.iteration.enum": supported,

  "statement.interface": supported,
  "statement.enum": supported,
  "statement.field.interface": supported,
  "statement.iteration.interface": supported,

  "value.typeAlias": supported,
  "value.field.enum": supported,
  "value.iteration.enum": supported,

  "interior.interface": supported,
  "interior.enum": supported,

  /* NOT APPLICABLE */

  // Element and tags
  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,
  "interior.element": notApplicable,
  "textFragment.element": notApplicable,

  // Miscellaneous
  "type.foreach": notApplicable,
};
