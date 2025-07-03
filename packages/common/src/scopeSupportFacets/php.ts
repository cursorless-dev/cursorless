import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const phpScopeSupport: LanguageScopeSupportFacetMap = {
  "comment.line": supported,
  "comment.block": supported,
  "textFragment.string.singleLine": supported,

  "argument.formal.singleLine": supported,
  "argument.formal.multiLine": supported,
  "argument.formal.iteration": supported,
  "argument.formal.constructor.singleLine": supported,
  "argument.formal.constructor.multiLine": supported,
  "argument.formal.constructor.iteration": supported,
  "argument.formal.method.singleLine": supported,
  "argument.formal.method.multiLine": supported,
  "argument.formal.method.iteration": supported,

  "argument.actual.constructor.singleLine": supported,
  "argument.actual.constructor.multiLine": supported,
  "argument.actual.constructor.iteration": supported,
  "argument.actual.method.singleLine": supported,
  "argument.actual.method.multiLine": supported,
  "argument.actual.method.iteration": supported,
  "argument.actual.singleLine": supported,
  "argument.actual.multiLine": supported,
  "argument.actual.iteration": supported,

  "name.variable": supported,
  "name.assignment": supported,

  "key.mapPair": supported,

  "value.variable": supported,
  "value.assignment": supported,
  "value.mapPair": supported,
  "value.return": supported,
  "value.yield": supported,

  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.cast": supported,
  "type.field.class": supported,

  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.field.class": supported,

  disqualifyDelimiter: supported,
};
