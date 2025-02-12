import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, notApplicable } = ScopeSupportFacetLevel;

export const xmlScopeSupport: LanguageScopeSupportFacetMap = {
  "comment.block": supported,
  "interior.element": supported,
  "key.attribute": supported,
  "string.singleLine": supported,
  "textFragment.comment.block": supported,
  "textFragment.element": supported,
  "textFragment.string.singleLine": supported,
  "value.attribute": supported,
  attribute: supported,
  element: supported,
  endTag: supported,
  startTag: supported,
  tags: supported,

  // Not applicable

  anonymousFunction: notApplicable,
  "argument.actual": notApplicable,
  "argument.actual.constructor": notApplicable,
  "argument.actual.constructor.iteration": notApplicable,
  "argument.actual.iteration": notApplicable,
  "argument.actual.method": notApplicable,
  "argument.actual.method.iteration": notApplicable,
  "argument.formal": notApplicable,
  "argument.formal.constructor": notApplicable,
  "argument.formal.constructor.iteration": notApplicable,
  "argument.formal.iteration": notApplicable,
  "argument.formal.method": notApplicable,
  "argument.formal.method.iteration": notApplicable,
  "branch.if": notApplicable,
  "branch.if.iteration": notApplicable,
  "branch.loop": notApplicable,
  "branch.switchCase": notApplicable,
  "branch.switchCase.iteration": notApplicable,
  "branch.ternary": notApplicable,
  "branch.try": notApplicable,
  "branch.try.iteration": notApplicable,
  class: notApplicable,
  "class.iteration.block": notApplicable,
  "class.iteration.document": notApplicable,
  className: notApplicable,
  "className.iteration.block": notApplicable,
  "className.iteration.document": notApplicable,
  "collectionItem.unenclosed": notApplicable,
  "collectionItem.unenclosed.iteration": notApplicable,
  command: notApplicable,
  "comment.line": notApplicable,
  "condition.doWhile": notApplicable,
  "condition.for": notApplicable,
  "condition.if": notApplicable,
  "condition.switchCase": notApplicable,
  "condition.switchCase.iteration": notApplicable,
  "condition.ternary": notApplicable,
  "condition.while": notApplicable,
  disqualifyDelimiter: notApplicable,
  environment: notApplicable,
  fieldAccess: notApplicable,
  functionCall: notApplicable,
  "functionCall.constructor": notApplicable,
  functionCallee: notApplicable,
  "functionCallee.constructor": notApplicable,
  functionName: notApplicable,
  "functionName.constructor": notApplicable,
  "functionName.iteration.block": notApplicable,
  "functionName.iteration.document": notApplicable,
  "functionName.method": notApplicable,
  "functionName.method.iteration.class": notApplicable,
  ifStatement: notApplicable,
  "interior.cell": notApplicable,
  "interior.class": notApplicable,
  "interior.command": notApplicable,
  "interior.function": notApplicable,
  "interior.if": notApplicable,
  "interior.lambda": notApplicable,
  "interior.loop": notApplicable,
  "interior.resource": notApplicable,
  "interior.switchCase": notApplicable,
  "interior.ternary": notApplicable,
  "interior.try": notApplicable,
  "key.mapPair": notApplicable,
  "key.mapPair.iteration": notApplicable,
  list: notApplicable,
  map: notApplicable,
  "name.argument.actual": notApplicable,
  "name.argument.actual.iteration": notApplicable,
  "name.argument.formal": notApplicable,
  "name.argument.formal.constructor": notApplicable,
  "name.argument.formal.constructor.iteration": notApplicable,
  "name.argument.formal.iteration": notApplicable,
  "name.argument.formal.method": notApplicable,
  "name.argument.formal.method.iteration": notApplicable,
  "name.assignment": notApplicable,
  "name.assignment.pattern": notApplicable,
  "name.class": notApplicable,
  "name.constructor": notApplicable,
  "name.field": notApplicable,
  "name.foreach": notApplicable,
  "name.function": notApplicable,
  "name.iteration.block": notApplicable,
  "name.iteration.document": notApplicable,
  "name.method": notApplicable,
  "name.resource": notApplicable,
  "name.resource.iteration": notApplicable,
  "name.variable": notApplicable,
  "name.variable.pattern": notApplicable,
  namedFunction: notApplicable,
  "namedFunction.constructor": notApplicable,
  "namedFunction.iteration.block": notApplicable,
  "namedFunction.iteration.document": notApplicable,
  "namedFunction.method": notApplicable,
  "namedFunction.method.iteration.class": notApplicable,
  notebookCell: notApplicable,
  pairDelimiter: notApplicable,
  regularExpression: notApplicable,
  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,
  statement: notApplicable,
  "statement.class": notApplicable,
  "statement.iteration.block": notApplicable,
  "statement.iteration.document": notApplicable,
  "string.multiLine": notApplicable,
  switchStatementSubject: notApplicable,
  "textFragment.comment.line": notApplicable,
  "textFragment.string.multiLine": notApplicable,
  "type.alias": notApplicable,
  "type.argument.formal": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.cast": notApplicable,
  "type.class": notApplicable,
  "type.enum": notApplicable,
  "type.field": notApplicable,
  "type.field.iteration": notApplicable,
  "type.foreach": notApplicable,
  "type.interface": notApplicable,
  "type.return": notApplicable,
  "type.typeArgument": notApplicable,
  "type.typeArgument.iteration": notApplicable,
  "type.variable": notApplicable,
  "value.argument.actual": notApplicable,
  "value.argument.actual.iteration": notApplicable,
  "value.argument.formal": notApplicable,
  "value.argument.formal.constructor": notApplicable,
  "value.argument.formal.constructor.iteration": notApplicable,
  "value.argument.formal.iteration": notApplicable,
  "value.argument.formal.method": notApplicable,
  "value.argument.formal.method.iteration": notApplicable,
  "value.assignment": notApplicable,
  "value.field": notApplicable,
  "value.foreach": notApplicable,
  "value.mapPair": notApplicable,
  "value.mapPair.iteration": notApplicable,
  "value.resource": notApplicable,
  "value.resource.iteration": notApplicable,
  "value.return": notApplicable,
  "value.return.lambda": notApplicable,
  "value.typeAlias": notApplicable,
  "value.variable": notApplicable,
  "value.variable.pattern": notApplicable,
  "value.yield": notApplicable,
};
