import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const swiftScopeSupport: LanguageScopeSupportFacetMap = {
  // Collections
  list: supported,
  map: supported,
  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  // Control flow
  ifStatement: supported,
  switchStatementSubject: supported,
  
  // Text fragments
  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,
  "textFragment.comment.line": supported,
  "textFragment.comment.block": supported,

  // Statements and blocks
  statement: supported,
  "statement.iteration.document": supported,
  "statement.iteration.block": supported,

  // Classes and types
  class: supported,
  className: supported,

  // Functions
  anonymousFunction: supported,
  namedFunction: supported,
  "namedFunction.iteration": supported,
  "namedFunction.iteration.document": supported,
  "namedFunction.method": supported,
  "namedFunction.method.iteration.class": supported,
  "namedFunction.constructor": supported,

  // Function names
  functionName: supported,
  "functionName.iteration": supported,
  "functionName.iteration.document": supported,
  "functionName.method": supported,
  "functionName.method.iteration.class": supported,
  "functionName.constructor": supported,

  // Function calls
  functionCall: supported,
  "functionCall.constructor": supported,
  functionCallee: supported,
  "functionCallee.constructor": supported,

  // Arguments and parameters
  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.actual.method": supported,
  "argument.actual.method.iteration": supported,
  "argument.actual.constructor": supported,
  "argument.actual.constructor.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,
  "argument.formal.method": supported,
  "argument.formal.method.iteration": supported,
  "argument.formal.constructor": supported,
  "argument.formal.constructor.iteration": supported,

  // Comments
  "comment.line": supported,
  "comment.block": supported,

  // Strings
  "string.singleLine": supported,
  "string.multiLine": supported,

  // Branches
  "branch.if": supported,
  "branch.if.iteration": supported,
  "branch.try": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": notApplicable, // Swift doesn't have ternary operators in the same way

  // Conditions
  "condition.if": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.for": supported,
  "condition.ternary": notApplicable,
  "condition.switchCase": supported,

  // Names
  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.argument.formal.constructor": supported,
  "name.argument.formal.constructor.iteration": supported,
  "name.foreach": supported,
  "name.assignment": supported,
  "name.assignment.pattern": supported,
  "name.variable": supported,
  "name.variable.pattern": supported,
  "name.function": supported,
  "name.method": supported,
  "name.constructor": supported,
  "name.class": supported,
  "name.field": supported,

  // Types
  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.argument.formal.method": supported,
  "type.argument.formal.method.iteration": supported,
  "type.argument.formal.constructor": supported,
  "type.argument.formal.constructor.iteration": supported,
  "type.return": supported,
  "type.field": supported,
  "type.interface": supported,
  "type.variable": supported,

  // Swift-specific features
  disqualifyDelimiter: supported,
  fieldAccess: supported,
  regularExpression: notApplicable, // Swift doesn't have regex literals
}; 