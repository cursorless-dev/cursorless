import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const gdscriptScopeSupport: LanguageScopeSupportFacetMap = {
  // supported
  "comment.line": supported,
  "statement.return": supported,

  // unsupported (none currently defined)

  // not applicable
  "comment.block": notApplicable,
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
