import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const pythonScopeSupport: LanguageScopeSupportFacetMap = {
  "name.foreach": supported,
  "name.resource": supported,
  "name.resource.iteration": supported,
  "name.argument.actual": supported,
  "name.argument.actual.iteration": supported,
  "name.argument.formal": supported,
  "name.argument.formal.constructor": supported,
  "name.argument.formal.constructor.iteration": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.assignment": supported,
  "name.assignment.pattern": supported,
  "name.class": supported,
  "name.constructor": supported,
  "name.field": supported,
  "name.function": supported,
  "name.iteration.block": supported,
  "name.iteration.document": supported,
  "name.method": supported,
  "name.variable": supported,
  "name.variable.pattern": supported,

  "value.foreach": supported,
  "value.yield": supported,
  "value.resource": supported,
  "value.resource.iteration": supported,
  "value.argument.actual": supported,
  "value.argument.actual.iteration": supported,
  "value.argument.formal": supported,
  "value.argument.formal.constructor": supported,
  "value.argument.formal.constructor.iteration": supported,
  "value.argument.formal.iteration": supported,
  "value.argument.formal.method": supported,
  "value.argument.formal.method.iteration": supported,
  "value.assignment": supported,
  "value.field": supported,
  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.return": supported,
  "value.return.lambda": supported,
  "value.variable": supported,
  "value.variable.pattern": supported,

  anonymousFunction: supported,
  namedFunction: supported,
  "namedFunction.constructor": supported,
  "namedFunction.iteration.document": supported,
  "namedFunction.method": supported,
  "namedFunction.method.iteration.class": supported,

  functionName: supported,
  "functionName.constructor": supported,
  "functionName.iteration.document": supported,
  "functionName.method": supported,
  "functionName.method.iteration.class": supported,

  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,
  "argument.actual.constructor": supported,
  "argument.actual.constructor.iteration": supported,
  "argument.actual.method": supported,
  "argument.actual.method.iteration": supported,
  "argument.formal.constructor": supported,
  "argument.formal.constructor.iteration": supported,
  "argument.formal.method": supported,
  "argument.formal.method.iteration": supported,

  "collectionItem.unenclosed": supported,
  "collectionItem.unenclosed.iteration": supported,

  "branch.if": supported,
  "branch.if.iteration": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": supported,
  "branch.try": supported,
  "branch.try.iteration": supported,
  "branch.loop": supported,

  class: supported,
  "class.iteration.document": supported,

  className: supported,
  "className.iteration.document": supported,

  "interior.class": supported,
  "interior.function": supported,
  "interior.lambda": supported,
  "interior.if": supported,
  "interior.try": supported,
  "interior.switchCase": supported,
  "interior.ternary": supported,
  "interior.loop": supported,
  "interior.with": supported,

  switchStatementSubject: supported,

  "condition.if": supported,
  "condition.switchCase": supported,
  "condition.switchCase.iteration": supported,
  "condition.ternary": supported,
  "condition.while": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  list: supported,
  map: supported,

  "comment.line": supported,

  "string.multiLine": supported,
  "string.singleLine": supported,

  "textFragment.comment.line": supported,
  "textFragment.string.multiLine": supported,
  "textFragment.string.singleLine": supported,

  ifStatement: supported,
  statement: supported,
  "statement.class": supported,
  "statement.iteration.block": supported,
  "statement.iteration.document": supported,

  functionCall: supported,
  "functionCall.constructor": supported,
  functionCallee: supported,
  "functionCallee.constructor": supported,

  disqualifyDelimiter: supported,
  pairDelimiter: supported,
  fieldAccess: supported,

  // Unsupported

  "namedFunction.iteration": unsupported,
  "functionName.iteration": unsupported,
  "class.iteration.block": unsupported,
  "className.iteration.block": unsupported,

  // Not applicable

  "comment.block": notApplicable,
  "condition.doWhile": notApplicable,
  "condition.for": notApplicable,
  "interior.cell": notApplicable,
  "interior.command": notApplicable,
  "interior.element": notApplicable,
  "key.attribute": notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,
  "textFragment.comment.block": notApplicable,
  "textFragment.element": notApplicable,
  "value.attribute": notApplicable,
  attribute: notApplicable,
  command: notApplicable,
  element: notApplicable,
  endTag: notApplicable,
  environment: notApplicable,
  notebookCell: notApplicable,
  regularExpression: notApplicable,
  section: notApplicable,
  startTag: notApplicable,
  tags: notApplicable,

  //   "value.typeAlias": supported,
  //   "type.alias":,
  //   "type.argument.formal":,
  //   "type.argument.formal.constructor":,
  //   "type.argument.formal.constructor.iteration":,
  //   "type.argument.formal.iteration":,
  //   "type.argument.formal.method":,
  //   "type.argument.formal.method.iteration":,
  //   "type.cast":,
  //   "type.class":,
  //   "type.enum":,
  //   "type.field":,
  //   "type.field.iteration":,
  //   "type.foreach":,
  //   "type.interface":,
  //   "type.return":,
  //   "type.typeArgument":,
  //   "type.typeArgument.iteration":,
  //   "type.variable":,
};
