import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

// eslint-disable-next-line
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const gdscriptScopeSupport: LanguageScopeSupportFacetMap = {
  // supported
  ifStatement: supported,
  "statement.if": supported,
  // not applicable
  "statement.interface": notApplicable,
  "statement.field.interface": notApplicable,
  "statement.iteration.interface": notApplicable,
  "name.interface": notApplicable,
  "name.field.interface": notApplicable,
  "name.iteration.interface": notApplicable,
  "type.field.interface": notApplicable,
  "type.interface": notApplicable,
  "type.iteration.interface": notApplicable,
  "interior.interface": notApplicable,
};
