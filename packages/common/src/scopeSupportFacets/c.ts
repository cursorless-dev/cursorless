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
  "name.function": supported,
  namedFunction: supported,
  functionName: supported,
  "name.argument.formal": supported,
  "value.argument.formal": notApplicable,
  "name.argument.formal.iteration": supported,
  "value.argument.formal.iteration": supported,
  "name.variable": supported,
  "value.variable": supported,
  "name.assignment": supported,
  "value.assignment": supported,
};
