import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const swiftScopeSupport: LanguageScopeSupportFacetMap = {
  // Collections
  list: supported,
  map: supported,
  key: supported,

  // Control flow
  ifStatement: supported,
  branch: supported,
  condition: supported,

  // Text fragments
  string: supported,
  comment: supported,

  // Statements and blocks
  statement: supported,

  // Classes and types
  class: supported,
  className: supported,
  type: supported,

  // Functions
  anonymousFunction: supported,
  namedFunction: supported,
  functionCall: supported,
  functionCallee: supported,

  // Arguments and parameters
  "argument.formal": supported,
  "argument.actual": supported,

  // Names and values
  name: supported,
  value: supported,

  // Swift-specific features
  regularExpression: notApplicable, // Swift doesn't have regex literals
}; 