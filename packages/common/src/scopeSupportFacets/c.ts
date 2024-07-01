import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const cScopeSupport: LanguageScopeSupportFacetMap = {
  ifStatement: supported,

  "comment.line": supported,
  "comment.block": supported,
  "string.singleLine": supported,
  "textFragment.comment.line": supported,
  "textFragment.comment.block": supported,
  "textFragment.string.singleLine": supported,

  class: supported,
  className: supported,

  namedFunction: supported,
  "name.function": supported,
  "name.class": supported,
  "name.field": supported,
  functionName: supported,

  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.variable": supported,
  "value.variable": supported,
  "name.assignment": supported,
  "value.assignment": supported,

  "statement.class": supported,

  "type.class": supported,
  "type.field": supported,

  "value.argument.formal": notApplicable,
  "value.argument.formal.iteration": notApplicable,
};
