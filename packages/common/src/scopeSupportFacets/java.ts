import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const javaScopeSupport: LanguageScopeSupportFacetMap = {
  disqualifyDelimiter: supported,
  anonymousFunction: supported,
  list: supported,
  map: supported,
  pairDelimiter: supported,
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

  class: supported,
  className: supported,

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

  "functionName.constructor": supported,
  "functionName.method": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "name.argument.formal.constructor": supported,
  "name.argument.formal.constructor.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.assignment": supported,
  "name.class": supported,
  "name.constructor": supported,
  "name.field": supported,
  "name.foreach": supported,
  "name.iteration.block": supported,
  "name.iteration.document": supported,
  "name.method": supported,
  "name.variable": supported,
  "name.variable.pattern": supported,
  "namedFunction.constructor": supported,
  "namedFunction.iteration.block": supported,
  "namedFunction.iteration.document": supported,
  "namedFunction.method": supported,

  ifStatement: supported,
  statement: supported,
  "statement.class": supported,
  "statement.iteration.block": supported,
  "statement.iteration.document": supported,

  "string.multiLine": supported,
  "string.singleLine": supported,

  "textFragment.comment.block": supported,
  "textFragment.comment.line": supported,
  "textFragment.string.multiLine": supported,
  "textFragment.string.singleLine": supported,

  "type.typeArgument": supported,
  "type.typeArgument.iteration": supported,

  "type.alias": supported,
  "type.argument.formal": supported,
  "type.argument.formal.constructor": supported,
  "type.argument.formal.constructor.iteration": supported,
  "type.argument.formal.iteration": supported,
  "type.argument.formal.method": supported,
  "type.argument.formal.method.iteration": supported,
  "type.cast": supported,
  "type.class": supported,
  "type.enum": supported,
  "type.foreach": supported,
  "type.field": supported,
  "type.field.iteration": supported,
  "type.interface": supported,
  "type.return": supported,
  "type.variable": supported,

  "value.argument.formal.constructor": supported,
  "value.argument.formal.constructor.iteration": supported,
  "value.argument.formal.method": supported,
  "value.argument.formal.method.iteration": supported,
  "value.assignment": supported,
  "value.foreach": supported,
  "value.field": supported,
  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.resource": supported,
  "value.resource.iteration": supported,
  "value.return": supported,
  "value.return.lambda": supported,
  "value.typeAlias": supported,
  "value.variable.pattern": supported,
  "value.yield": supported,

  // Unsupported

  "class.iteration.block": unsupported,
  "class.iteration.document": unsupported,
  "className.iteration.block": unsupported,
  "className.iteration.document": unsupported,

  "name.resource": unsupported,
  "name.resource.iteration": unsupported,

  "namedFunction.method.iteration.class": unsupported,

  "functionName.iteration.block": unsupported,
  "functionName.iteration.document": unsupported,
  "functionName.method.iteration.class": unsupported,

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

  "branch.loop": unsupported,
  fieldAccess: unsupported,

  // Not Applicable

  "name.assignment.pattern": notApplicable,
  "name.argument.actual": notApplicable,
  "name.argument.actual.iteration": notApplicable,
  "name.argument.formal": notApplicable,
  "name.argument.formal.iteration": notApplicable,
  "name.function": notApplicable,

  "value.variable": notApplicable,
  "value.attribute": notApplicable,
  "value.argument.actual": notApplicable,
  "value.argument.actual.iteration": notApplicable,
  "value.argument.formal": notApplicable,
  "value.argument.formal.iteration": supported,

  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,

  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  "textFragment.element": notApplicable,

  namedFunction: notApplicable,

  functionName: notApplicable,

  regularExpression: notApplicable,
  environment: notApplicable,
  "interior.cell": notApplicable,
  "interior.command": notApplicable,
  "key.attribute": notApplicable,
  notebookCell: notApplicable,
  attribute: notApplicable,
  command: notApplicable,
};
