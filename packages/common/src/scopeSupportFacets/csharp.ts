import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const csharpScopeSupport: LanguageScopeSupportFacetMap = {
  ifStatement: supported,
  class: supported,
  className: supported,
  anonymousFunction: supported,
  "class.iteration.document": supported,
  "class.iteration.block": supported,
  "className.iteration.document": supported,
  "className.iteration.block": supported,
};
