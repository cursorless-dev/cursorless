import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const swiftScopeSupport: LanguageScopeSupportFacetMap = {
  // Collections
  list: supported,
  map: supported,

  // Control flow
  ifStatement: supported,
  "condition.if": supported,
  "condition.switchCase": supported,
  "condition.switchCase.iteration": supported,

  // Text fragments
  "string.singleLine": supported,
  "string.multiLine": supported,
  "comment.line": supported,
  "comment.block": supported,

  // Statements and blocks
  statement: supported,

  // Classes and types
  class: supported,
  className: supported,
  "type.class": supported,
  "type.variable": supported,
  "type.return": supported,
  "type.field": supported,

  // Functions
  anonymousFunction: supported,
  namedFunction: supported,
  functionCall: supported,
  functionCallee: supported,

  // Arguments and parameters
  "argument.formal": supported,
  "argument.actual": supported,

  // Names and values
  "name.function": supported,
  "name.variable": supported,
  "name.field": supported,
  "value.variable": supported,
  "value.field": supported,

  // Swift-specific features
  regularExpression: notApplicable, // Swift doesn't have regex literals
};