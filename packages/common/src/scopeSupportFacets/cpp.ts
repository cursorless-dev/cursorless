import { cCoreScopeSupport } from "./c";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const cppScopeSupport: LanguageScopeSupportFacetMap = {
  ...cCoreScopeSupport,

  attribute: supported,
  anonymousFunction: supported,

  "branch.try": supported,
  "branch.try.iteration": supported,

  "argument.actual.constructor": supported,
  "argument.actual.constructor.iteration": supported,
  "argument.formal.method": supported,
  "argument.formal.method.iteration": supported,
  "argument.formal.constructor": supported,
  "argument.formal.constructor.iteration": supported,
  "argument.formal.lambda": supported,
  "argument.formal.lambda.iteration": supported,

  "argumentList.actual.constructor.empty": supported,
  "argumentList.actual.constructor.singleLine": supported,
  "argumentList.actual.constructor.multiLine": supported,
  "argumentList.formal.constructor.empty": supported,
  "argumentList.formal.constructor.singleLine": supported,
  "argumentList.formal.constructor.multiLine": supported,
  "argumentList.formal.lambda.empty": supported,
  "argumentList.formal.lambda.singleLine": supported,
  "argumentList.formal.lambda.multiLine": supported,
  "argumentList.formal.method.empty": supported,
  "argumentList.formal.method.singleLine": supported,
  "argumentList.formal.method.multiLine": supported,

  "functionCall.constructor": supported,
  "functionCallee.constructor": supported,

  "functionName.constructor": supported,
  "functionName.method": supported,
  "functionName.method.iteration.class": supported,

  "namedFunction.method": supported,
  "namedFunction.method.iteration.class": supported,
  "namedFunction.constructor": supported,

  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.argument.formal.constructor": supported,
  "name.argument.formal.constructor.iteration": supported,
  "name.constructor": supported,
  "name.foreach": supported,
  "name.method": supported,

  "value.argument.formal": supported,
  "value.argument.formal.iteration": supported,
  "value.argument.formal.method": supported,
  "value.argument.formal.method.iteration": supported,
  "value.argument.formal.constructor": supported,
  "value.argument.formal.constructor.iteration": supported,
  "value.foreach": supported,
  "value.return.lambda": supported,
  "value.field": supported,

  "type.argument.formal.method": supported,
  "type.argument.formal.method.iteration": supported,
  "type.argument.formal.constructor": supported,
  "type.argument.formal.constructor.iteration": supported,
  "type.foreach": supported,
  "type.typeArgument": supported,
  "type.typeArgument.iteration": supported,

  "interior.lambda": supported,
  "interior.try": supported,
};
