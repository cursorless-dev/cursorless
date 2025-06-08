import { cCoreScopeSupport } from "./c";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported } = ScopeSupportFacetLevel;

export const cppScopeSupport: LanguageScopeSupportFacetMap = {
  ...cCoreScopeSupport,

  "functionName.constructor": supported,
  "functionName.method": supported,

  "namedFunction.method": supported,
  "namedFunction.constructor": supported,

  attribute: supported,
  anonymousFunction: supported,

  "value.argument.formal": supported,
  "value.argument.formal.iteration": supported,
  "value.argument.formal.method": supported,
  "value.argument.formal.method.iteration": supported,
  "value.argument.formal.constructor": supported,
  "value.argument.formal.constructor.iteration": supported,

  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.argument.formal.constructor": supported,
  "name.argument.formal.constructor.iteration": supported,

  "type.argument.formal.method": supported,
  "type.argument.formal.constructor": supported,
  "type.foreach": supported,

  // Unsupported

  "argument.actual.constructor": unsupported,
  "argument.actual.constructor.iteration": unsupported,
  "argument.formal.method": unsupported,
  "argument.formal.method.iteration": unsupported,
  "argument.formal.constructor": unsupported,
  "argument.formal.constructor.iteration": unsupported,
  "argument.formal.lambda": unsupported,
  "argument.formal.lambda.iteration": unsupported,

  "argumentList.actual.method.empty": unsupported,
  "argumentList.actual.method.singleLine": unsupported,
  "argumentList.actual.method.multiLine": unsupported,
  "argumentList.actual.constructor.empty": unsupported,
  "argumentList.actual.constructor.singleLine": unsupported,
  "argumentList.actual.constructor.multiLine": unsupported,
  "argumentList.formal.constructor.empty": unsupported,
  "argumentList.formal.constructor.singleLine": unsupported,
  "argumentList.formal.constructor.multiLine": unsupported,
  "argumentList.formal.lambda.empty": unsupported,
  "argumentList.formal.lambda.singleLine": unsupported,
  "argumentList.formal.lambda.multiLine": unsupported,
  "argumentList.formal.method.empty": unsupported,
  "argumentList.formal.method.singleLine": unsupported,
  "argumentList.formal.method.multiLine": unsupported,

  "functionName.iteration.block": unsupported,
  "functionName.method.iteration.class": unsupported,

  "functionCall.constructor": unsupported,
  "functionCallee.constructor": unsupported,

  "name.constructor": unsupported,
  "name.foreach": unsupported,
  "name.method": unsupported,
  "namedFunction.iteration.block": unsupported,
  "namedFunction.method.iteration.class": unsupported,

  "value.foreach": unsupported,
  "value.return.lambda": unsupported,
  "value.field": unsupported,

  "type.typeArgument": unsupported,
  "type.typeArgument.iteration": unsupported,
  "type.argument.formal.method.iteration": unsupported,
  "type.argument.formal.constructor.iteration": unsupported,

  "interior.lambda": unsupported,

  "branch.try": unsupported,
  "branch.try.iteration": unsupported,
  "interior.try": unsupported,
};
