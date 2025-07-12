import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const goScopeSupport: LanguageScopeSupportFacetMap = {
  disqualifyDelimiter: supported,

  "comment.line": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,
  "textFragment.comment.line": supported,
};
