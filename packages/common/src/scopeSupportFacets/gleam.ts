/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const gleamScopeSupport: LanguageScopeSupportFacetMap = {
  "name.variable": supported,
  "value.variable": supported,
  functionCallee: supported,
  functionCall: supported,
  anonymousFunction: supported,
  "type.alias": supported,
  "type.formalParameter": supported,
  "type.variable": supported,
  "type.return": supported,
  "branch.switchCase": supported,
  statement: supported,
  "statement.iteration.document": supported,
  namedFunction: supported,
  list: supported,
  functionName: supported,
  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,
  "comment.line": supported,
  "string.singleLine": supported,
  "condition.switchCase": supported,
  "name.function": supported,
};
