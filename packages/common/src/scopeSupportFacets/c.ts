/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const cScopeSupport: LanguageScopeSupportFacetMap = {
  ifStatement: supported,
  "comment.line": supported,
  "string.singleLine": supported,
};
