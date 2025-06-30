import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const csharpScopeSupport: LanguageScopeSupportFacetMap = {
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

  "comment.line": supported,
  "comment.block": supported,

  functionCall: supported,
  "functionCall.constructor": supported,
  functionCallee: supported,
  "functionCallee.constructor": supported,

  namedFunction: supported,
  "namedFunction.iteration.document": supported,
  "namedFunction.constructor": supported,
  "namedFunction.method": supported,
  "namedFunction.method.iteration.class": supported,

  functionName: supported,
  "functionName.iteration.document": supported,
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
  "branch.ternary.iteration": supported,

  "condition.for": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.if": supported,
  "condition.switchCase": supported,
  "condition.ternary": supported,
  "condition.switchCase.iteration": supported,

  "name.argument.formal.constructor": supported,
  "name.argument.formal.constructor.iteration": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.argument.formal": supported,
  "name.assignment": supported,
  "name.class": supported,
  "name.constructor": supported,
  "name.field": supported,
  "name.foreach": supported,
  "name.function": supported,
  "name.iteration.block": supported,
  "name.iteration.document": supported,
  "name.method": supported,
  "name.variable": supported,

  "value.argument.formal.constructor": supported,
  "value.argument.formal.constructor.iteration": supported,
  "value.argument.formal.iteration": supported,
  "value.argument.formal.method": supported,
  "value.argument.formal.method.iteration": supported,
  "value.argument.formal": supported,
  "value.assignment": supported,
  "value.field": supported,
  "value.foreach": supported,
  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.return.lambda": supported,
  "value.return": supported,
  "value.variable": supported,
  "value.yield": supported,

  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.argument.formal.method": supported,
  "type.argument.formal.method.iteration": supported,
  "type.argument.formal.constructor": supported,
  "type.argument.formal.constructor.iteration": supported,
  "type.cast": supported,
  "type.class": supported,
  "type.foreach": supported,
  "type.field": supported,
  "type.field.iteration": supported,
  "type.interface": supported,
  "type.enum": supported,
  "type.return": supported,
  "type.variable": supported,
  "type.typeArgument": supported,
  "type.typeArgument.iteration": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "argumentList.actual.empty": supported,
  "argumentList.actual.singleLine": supported,
  "argumentList.actual.multiLine": supported,
  "argumentList.actual.method.empty": supported,
  "argumentList.actual.method.singleLine": supported,
  "argumentList.actual.method.multiLine": supported,
  "argumentList.actual.constructor.empty": supported,
  "argumentList.actual.constructor.singleLine": supported,
  "argumentList.actual.constructor.multiLine": supported,

  "argumentList.formal.empty": supported,
  "argumentList.formal.singleLine": supported,
  "argumentList.formal.multiLine": supported,
  "argumentList.formal.lambda.empty": supported,
  "argumentList.formal.lambda.singleLine": supported,
  "argumentList.formal.lambda.multiLine": supported,
  "argumentList.formal.method.empty": supported,
  "argumentList.formal.method.singleLine": supported,
  "argumentList.formal.method.multiLine": supported,
  "argumentList.formal.constructor.empty": supported,
  "argumentList.formal.constructor.singleLine": supported,
  "argumentList.formal.constructor.multiLine": supported,

  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.actual.constructor": supported,
  "argument.actual.constructor.iteration": supported,
  "argument.actual.method": supported,
  "argument.actual.method.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,
  "argument.formal.lambda": supported,
  "argument.formal.lambda.iteration": supported,
  "argument.formal.constructor": supported,
  "argument.formal.constructor.iteration": supported,
  "argument.formal.method": supported,
  "argument.formal.method.iteration": supported,

  ifStatement: supported,
  statement: supported,
  "statement.class": supported,
  "statement.iteration.block": supported,
  "statement.iteration.document": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,
  "textFragment.comment.line": supported,
  "textFragment.comment.block": supported,

  "interior.class": supported,
  "interior.function": supported,
  "interior.constructor": supported,
  "interior.method": supported,
  "interior.if": supported,
  "interior.lambda.block": supported,
  "interior.lambda.expression": supported,
  "interior.for": supported,
  "interior.foreach": supported,
  "interior.while": supported,
  "interior.doWhile": supported,
  "interior.switch": supported,
  "interior.switchCase": supported,
  "interior.ternary": supported,
  "interior.try": supported,

  /* UNSUPPORTED  */

  fieldAccess: unsupported,

  /* NOT APPLICABLE */

  // Element and tags
  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  "interior.element": notApplicable,
  "textFragment.element": notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,

  // Keyword argument
  "name.argument.actual": notApplicable,
  "name.argument.actual.iteration": notApplicable,
  "value.argument.actual": notApplicable,
  "value.argument.actual.iteration": notApplicable,

  // Functions in blocks
  "functionName.iteration.block": notApplicable,
  "namedFunction.iteration.block": notApplicable,

  // Resource syntax
  "interior.resource": notApplicable,
  "type.resource": notApplicable,
  "type.resource.iteration": notApplicable,
  "name.resource": notApplicable,
  "name.resource.iteration": notApplicable,
  "value.resource": notApplicable,
  "value.resource.iteration": notApplicable,

  // Pattern destructing
  "name.assignment.pattern": notApplicable,
  "name.variable.pattern": notApplicable,
  "value.variable.pattern": notApplicable,

  // Type alias
  "type.alias": notApplicable,
  "value.typeAlias": notApplicable,

  // Section
  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,

  // Command
  command: notApplicable,
  "interior.command": notApplicable,

  // Notebook cell
  notebookCell: notApplicable,
  "interior.cell": notApplicable,

  // Collection item
  "collectionItem.unenclosed.iteration": notApplicable,
  "collectionItem.unenclosed": notApplicable,

  // Namespace
  "name.namespace": notApplicable,
  "interior.namespace": notApplicable,

  // Branch loop
  "branch.loop": notApplicable,
  "branch.loop.iteration": notApplicable,

  // Miscellaneous
  environment: notApplicable,
  pairDelimiter: notApplicable,
  regularExpression: notApplicable,
  selector: notApplicable,
  unit: notApplicable,
  "interior.static": notApplicable,
};
