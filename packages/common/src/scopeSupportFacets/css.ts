import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const cssScopeSupport: LanguageScopeSupportFacetMap = {
  "comment.block": supported,
  "string.singleLine": supported,
  "name.iteration.block": supported,
  "name.iteration.document": supported,
  disqualifyDelimiter: supported,

  "comment.line": unsupported,
};
