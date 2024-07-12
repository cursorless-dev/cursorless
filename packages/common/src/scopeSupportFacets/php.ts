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

  "name.variable": supported,
  "name.assignment": supported,

  "key.mapPair": supported,

  "value.variable": supported,
  "value.assignment": supported,
  "value.mapPair": supported,
  "value.return": supported,
  "value.yield": supported,
};
