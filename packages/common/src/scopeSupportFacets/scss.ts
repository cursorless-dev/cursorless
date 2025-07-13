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

  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.function": supported,
  "name.iteration.document": supported,
  "name.iteration.block": supported,

  "value.argument.formal": supported,
  "value.argument.formal.iteration": supported,
  "value.return": supported,

  "textFragment.comment.line": supported,

  ifStatement: supported,
  "branch.if": supported,
  "branch.if.elif.else": supported,
  "branch.if.else": supported,
  "branch.if.iteration": supported,
  "condition.if": supported,

  "interior.if": supported,
  "interior.function": supported,

  "argument.actual.singleLine": supported,
  "argument.actual.multiLine": supported,
};
