import { cssScopeSupport } from "./css";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const scssScopeSupport: LanguageScopeSupportFacetMap = {
  ...cssScopeSupport,

  "comment.line": supported,

  namedFunction: supported,
  "namedFunction.iteration.block": supported,
  "namedFunction.iteration.document": supported,

  functionName: supported,
  "functionName.iteration.block": supported,
  "functionName.iteration.document": supported,

  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.function": supported,

  "value.argument.formal": supported,
  "value.argument.formal.iteration": supported,
  "value.return": supported,

  "textFragment.comment.line": supported,

  ifStatement: supported,
  "branch.if": supported,
  "branch.if.iteration": supported,
  "condition.if": supported,

  "interior.if": supported,
  "interior.function": supported,

  "argument.actual.multiLine": supported,
};
