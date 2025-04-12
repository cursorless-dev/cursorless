import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const javaScopeSupport: LanguageScopeSupportFacetMap = {
  disqualifyDelimiter: supported,
  anonymousFunction: supported,
  list: supported,
  switchStatementSubject: supported,

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

  "collectionItem.unenclosed": supported,
  "collectionItem.unenclosed.iteration": supported,

  "branch.if": supported,
  "branch.if.iteration": supported,
  "branch.try": supported,
  "branch.try.iteration": supported,

  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": supported,
  "branch.loop": supported,

  class: supported,
  "class.iteration.block": supported,
  "class.iteration.document": supported,

  className: supported,
  "className.iteration.block": supported,
  "className.iteration.document": supported,

  "comment.block": supported,
  "comment.line": supported,

  "condition.doWhile": supported,
  "condition.for": supported,
  "condition.if": supported,
  "condition.switchCase": supported,
  "condition.switchCase.iteration": supported,
  "condition.ternary": supported,
  "condition.while": supported,

  functionCall: supported,
  "functionCall.constructor": supported,
  functionCallee: supported,
  "functionCallee.constructor": supported,

  "namedFunction.constructor": supported,
  "namedFunction.method": supported,
  "namedFunction.method.iteration.class": supported,

  "functionName.constructor": supported,
  "functionName.method": supported,
  "functionName.method.iteration.class": supported,

  "name.argument.formal.constructor": supported,
  "name.argument.formal.constructor.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.assignment": supported,
  "name.class": supported,
  "name.constructor": supported,
  "name.field": supported,
  "name.foreach": supported,
  "name.method": supported,
  "name.variable": supported,
  "name.iteration.document": supported,
  "name.iteration.block": supported,
  "name.resource": supported,

  ifStatement: supported,
  statement: supported,
  "statement.class": supported,
  "statement.iteration.block": supported,
  "statement.iteration.document": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "textFragment.comment.block": supported,
  "textFragment.comment.line": supported,
  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,

  "type.argument.formal.constructor": supported,
  "type.argument.formal.method": supported,
  "type.foreach": supported,
  "type.field": supported,
  "type.field.iteration": supported,
  "type.return": supported,
  "type.variable": supported,
  "type.typeArgument": supported,
  "type.typeArgument.iteration": supported,
  "type.resource": supported,

  "value.assignment": supported,
  "value.foreach": supported,
  "value.field": supported,
  "value.return": supported,
  "value.return.lambda": supported,
  "value.variable": supported,
  "value.resource": supported,

  // Unsupported

  "type.argument.formal.constructor.iteration": unsupported,
  "type.argument.formal.method.iteration": unsupported,
  "type.cast": unsupported,
  "type.class": unsupported,
  "type.enum": unsupported,
  "type.interface": unsupported,

  "interior.class": unsupported,
  "interior.element": unsupported,
  "interior.function": unsupported,
  "interior.if": unsupported,
  "interior.lambda": unsupported,
  "interior.loop": unsupported,
  "interior.resource": unsupported,
  "interior.switchCase": unsupported,
  "interior.ternary": unsupported,
  "interior.try": unsupported,

  fieldAccess: unsupported,

  // Not Applicable

  "name.assignment.pattern": notApplicable,
  "name.argument.actual": notApplicable,
  "name.argument.actual.iteration": notApplicable,
  "name.argument.formal": notApplicable,
  "name.argument.formal.iteration": notApplicable,
  "name.function": notApplicable,
  "name.variable.pattern": notApplicable,
  "name.resource.iteration": notApplicable,

  "key.mapPair": notApplicable,
  "key.mapPair.iteration": notApplicable,

  "value.attribute": notApplicable,
  "value.argument.actual": notApplicable,
  "value.argument.actual.iteration": notApplicable,
  "value.argument.formal": notApplicable,
  "value.argument.formal.iteration": notApplicable,
  "value.argument.formal.constructor": notApplicable,
  "value.argument.formal.constructor.iteration": notApplicable,
  "value.argument.formal.method": notApplicable,
  "value.argument.formal.method.iteration": notApplicable,
  "value.mapPair": notApplicable,
  "value.mapPair.iteration": notApplicable,
  "value.variable.pattern": notApplicable,
  "value.typeAlias": notApplicable,
  "value.yield": notApplicable,
  "value.resource.iteration": notApplicable,

  "type.argument.formal": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.alias": notApplicable,
  "type.resource.iteration": notApplicable,

  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,

  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  "textFragment.element": notApplicable,

  namedFunction: notApplicable,
  "namedFunction.iteration.document": notApplicable,
  "namedFunction.iteration.block": notApplicable,

  "functionName.iteration.document": notApplicable,
  "functionName.iteration.block": notApplicable,

  pairDelimiter: notApplicable,
  functionName: notApplicable,
  map: notApplicable,
  regularExpression: notApplicable,
  environment: notApplicable,
  "interior.cell": notApplicable,
  "interior.command": notApplicable,
  "key.attribute": notApplicable,
  notebookCell: notApplicable,
  attribute: notApplicable,
  command: notApplicable,
};
