import { cssScopeSupport } from "./css";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported } = ScopeSupportFacetLevel;

export const scssScopeSupport: LanguageScopeSupportFacetMap = {
  ...cssScopeSupport,

  "comment.line": supported,

  "condition.if": supported,

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

  ifStatement: supported,

  "textFragment.comment.line": supported,

  // Unsupported

  "branch.if": unsupported,
  "branch.if.iteration": unsupported,

  "interior.function": unsupported,
  "interior.if": unsupported,
};
