import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const csharpScopeSupport: LanguageScopeSupportFacetMap = {
  ifStatement: supported,
  switchStatementSubject: supported,
  anonymousFunction: supported,
  map: supported,
  list: supported,

  class: supported,
  "class.iteration.document": supported,
  "class.iteration.block": supported,

  className: supported,
  "className.iteration.document": supported,
  "className.iteration.block": supported,

  functionCall: supported,
  "functionCall.constructor": supported,
  functionCallee: supported,
  "functionCallee.constructor": supported,

  namedFunction: supported,
  "namedFunction.constructor": supported,
  "namedFunction.method": supported,

  functionName: supported,
  "functionName.constructor": supported,
  "functionName.method": supported,

  "condition.for": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.if": supported,
  "condition.switchCase": supported,
  "condition.ternary": supported,
  "condition.switchCase.iteration": supported,

  "name.variable": supported,
  "name.assignment": supported,

  "value.variable": supported,
  "value.assignment": supported,

  "type.variable": supported,
  "type.argument.formal": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,

  regularExpression: notApplicable,
};
