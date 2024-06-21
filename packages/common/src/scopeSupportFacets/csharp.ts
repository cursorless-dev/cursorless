/* eslint-disable @typescript-eslint/naming-convention */

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

  //   "name.function": supported,
  //   "name.method": supported,
  // "name.constructor": supported,

  "condition.for": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.if": supported,
  "condition.switchCase": supported,
  "condition.ternary": supported,

  regularExpression: unsupported,
};
