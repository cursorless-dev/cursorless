import { cssScopeSupport } from "./css";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported } = ScopeSupportFacetLevel;

export const scssScopeSupport: LanguageScopeSupportFacetMap = {
  ...cssScopeSupport,

  "comment.line": supported,
  "textFragment.comment.line": supported,

  namedFunction: supported,
  "namedFunction.iteration.block": supported,
  "namedFunction.iteration.document": supported,

  functionName: supported,
  "functionName.iteration.block": supported,
  "functionName.iteration.document": supported,

  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,

  "value.argument.formal": supported,
  "value.argument.formal.iteration": supported,
  "value.return": supported,

  ifStatement: supported,

  "condition.if": supported,

  // Unsupported

  "branch.if.iteration": unsupported,
  "branch.if": unsupported,

  "interior.function": unsupported,
  "interior.if": unsupported,
};
