import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const csharpScopeSupport: LanguageScopeSupportFacetMap = {
  ifStatement: supported,
  switchStatementSubject: supported,
  anonymousFunction: supported,
  map: supported,
  list: supported,
  disqualifyDelimiter: supported,
  attribute: supported,

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
  "namedFunction.method.iteration.class": supported,

  functionName: supported,
  "functionName.constructor": supported,
  "functionName.method": supported,
  "functionName.method.iteration.class": supported,

  "branch.if": supported,
  "branch.if.iteration": supported,
  "branch.try": supported,
  "branch.try.iteration": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": supported,
  "branch.loop": supported,

  "condition.for": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.if": supported,
  "condition.switchCase": supported,
  "condition.ternary": supported,
  "condition.switchCase.iteration": supported,

  "name.variable": supported,
  "name.assignment": supported,
  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,

  "value.variable": supported,
  "value.assignment": supported,
  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.argument.formal": supported,
  "value.argument.formal.iteration": supported,

  "type.variable": supported,
  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "argumentList.actual": supported,
  "argumentList.actual.constructor": supported,
  "argumentList.actual.method": supported,
  "argumentList.formal": supported,
  "argumentList.formal.lambda": supported,
  "argumentList.formal.constructor": supported,
  "argumentList.formal.method": supported,

  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.actual.constructor": supported,
  "argument.actual.constructor.iteration": supported,
  "argument.actual.method": supported,
  "argument.actual.method.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,
  "argument.formal.constructor": supported,
  "argument.formal.constructor.iteration": supported,
  "argument.formal.method": supported,
  "argument.formal.method.iteration": supported,

  // Not applicable

  "interior.element": notApplicable,
  "key.attribute": notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,
  "textFragment.element": notApplicable,
  command: notApplicable,
  element: notApplicable,
  endTag: notApplicable,
  environment: notApplicable,
  notebookCell: notApplicable,
  regularExpression: notApplicable,
  section: notApplicable,
  startTag: notApplicable,
  tags: notApplicable,
};
