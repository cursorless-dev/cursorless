import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const cssScopeSupport: LanguageScopeSupportFacetMap = {
  "comment.block": supported,
  "string.singleLine": supported,
  disqualifyDelimiter: supported,
  map: supported,

  functionCall: supported,
  functionCallee: supported,

  "argument.actual": supported,
  "argument.actual.iteration": supported,

  "name.iteration.document": supported,
  "name.iteration.block": supported,

  "textFragment.comment.block": supported,
  "textFragment.string.singleLine": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "value.mapPair": supported,
  "value.mapPair.iteration": supported,

  "collectionItem.unenclosed": supported,
  "collectionItem.unenclosed.iteration": supported,

  statement: supported,
  "statement.iteration.document": supported,

  // Not applicable

  anonymousFunction: notApplicable,
  "argument.actual.constructor.iteration": notApplicable,
  "argument.actual.constructor": notApplicable,
  "argument.actual.method.iteration": notApplicable,
  "argument.actual.method": notApplicable,
  "argument.formal.constructor.iteration": notApplicable,
  "argument.formal.constructor": notApplicable,
  "argument.formal.iteration": notApplicable,
  "argument.formal.method.iteration": notApplicable,
  "argument.formal.method": notApplicable,
  "argument.formal": notApplicable,
  attribute: notApplicable,
  "branch.if.iteration": notApplicable,
  "branch.if": notApplicable,
  "branch.loop": notApplicable,
  "branch.switchCase.iteration": notApplicable,
  "branch.switchCase": notApplicable,
  "branch.ternary": notApplicable,
  "branch.try.iteration": notApplicable,
  "branch.try": notApplicable,
  "class.iteration.block": notApplicable,
  "class.iteration.document": notApplicable,
  class: notApplicable,
  "className.iteration.block": notApplicable,
  "className.iteration.document": notApplicable,
  className: notApplicable,
  command: notApplicable,
  "comment.line": notApplicable,
  "condition.doWhile": notApplicable,
  "condition.for": notApplicable,
  "condition.if": notApplicable,
  "condition.switchCase.iteration": notApplicable,
  "condition.switchCase": notApplicable,
  "condition.ternary": notApplicable,
  "condition.while": notApplicable,
  element: notApplicable,
  endTag: notApplicable,
  environment: notApplicable,
  fieldAccess: notApplicable,
  "functionCall.constructor": notApplicable,
  "functionCallee.constructor": notApplicable,
  "functionName.constructor": notApplicable,
  "functionName.iteration.block": notApplicable,
  "functionName.iteration.document": notApplicable,
  "functionName.method.iteration.class": notApplicable,
  "functionName.method": notApplicable,
  functionName: notApplicable,
  ifStatement: notApplicable,
  "interior.cell": notApplicable,
  "interior.class": notApplicable,
  "interior.command": notApplicable,
  "interior.element": notApplicable,
  "interior.function": notApplicable,
  "interior.if": notApplicable,
  "interior.lambda": notApplicable,
  "interior.loop": notApplicable,
  "interior.resource": notApplicable,
  "interior.switchCase": notApplicable,
  "interior.ternary": notApplicable,
  "interior.try": notApplicable,
  "key.attribute": notApplicable,
  list: notApplicable,
  "name.argument.actual.iteration": notApplicable,
  "name.argument.actual": notApplicable,
  "name.argument.formal.constructor.iteration": notApplicable,
  "name.argument.formal.constructor": notApplicable,
  "name.argument.formal.iteration": notApplicable,
  "name.argument.formal.method.iteration": notApplicable,
  "name.argument.formal.method": notApplicable,
  "name.argument.formal": notApplicable,
  "name.assignment.pattern": notApplicable,
  "name.assignment": notApplicable,
  "name.class": notApplicable,
  "name.constructor": notApplicable,
  "name.field": notApplicable,
  "name.foreach": notApplicable,
  "name.function": notApplicable,
  "name.method": notApplicable,
  "name.resource.iteration": notApplicable,
  "name.resource": notApplicable,
  "name.variable.pattern": notApplicable,
  "name.variable": notApplicable,
  "namedFunction.constructor": notApplicable,
  "namedFunction.iteration.block": notApplicable,
  "namedFunction.iteration.document": notApplicable,
  "namedFunction.method.iteration.class": notApplicable,
  "namedFunction.method": notApplicable,
  namedFunction: notApplicable,
  notebookCell: notApplicable,
  pairDelimiter: notApplicable,
  regularExpression: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,
  section: notApplicable,
  startTag: notApplicable,
  "statement.iteration.block": notApplicable,
  "statement.class": notApplicable,
  "string.multiLine": notApplicable,
  switchStatementSubject: notApplicable,
  tags: notApplicable,
  "textFragment.comment.line": notApplicable,
  "textFragment.element": notApplicable,
  "textFragment.string.multiLine": notApplicable,
  "type.alias": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal": notApplicable,
  "type.cast": notApplicable,
  "type.class": notApplicable,
  "type.enum": notApplicable,
  "type.field.iteration": notApplicable,
  "type.field": notApplicable,
  "type.foreach": notApplicable,
  "type.interface": notApplicable,
  "type.return": notApplicable,
  "type.typeArgument.iteration": notApplicable,
  "type.typeArgument": notApplicable,
  "type.variable": notApplicable,
  "value.argument.actual.iteration": notApplicable,
  "value.argument.actual": notApplicable,
  "value.argument.formal.constructor.iteration": notApplicable,
  "value.argument.formal.constructor": notApplicable,
  "value.argument.formal.iteration": notApplicable,
  "value.argument.formal.method.iteration": notApplicable,
  "value.argument.formal.method": notApplicable,
  "value.argument.formal": notApplicable,
  "value.assignment": notApplicable,
  "value.attribute": notApplicable,
  "value.field": notApplicable,
  "value.foreach": notApplicable,
  "value.resource.iteration": notApplicable,
  "value.resource": notApplicable,
  "value.return.lambda": notApplicable,
  "value.return": notApplicable,
  "value.typeAlias": notApplicable,
  "value.variable.pattern": notApplicable,
  "value.variable": notApplicable,
  "value.yield": notApplicable,
};
