import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const javaScopeSupport: LanguageScopeSupportFacetMap = {
  disqualifyDelimiter: supported,

  "name.foreach": supported,

  "value.foreach": supported,

  "type.foreach": supported,
  "type.field": supported,
  "type.field.iteration": supported,
  "type.typeArgument": supported,
  "type.typeArgument.iteration": supported,

  "argument.formal": supported,
  "argument.formal.iteration": supported,
  "argument.actual": supported,
  "argument.actual.iteration": supported,

  element: notApplicable,
  tags: notApplicable,
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,

  "branch.if": supported,
  "branch.if.iteration": supported,
  "branch.try": supported,
  "branch.try.iteration": supported,
};
