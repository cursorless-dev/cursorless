import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const phpScopeSupport: LanguageScopeSupportFacetMap = {
  "comment.line": supported,
  "comment.block": supported,
  "textFragment.string.singleLine": supported,

  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.cast": supported,
  "type.field": supported,

  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.field": supported,
};
