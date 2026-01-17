import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const goScopeSupport: LanguageScopeSupportFacetMap = {
  disqualifyDelimiter: supported,

  list: supported,
  map: supported,

  ifStatement: supported,

  class: supported,
  "class.iteration.block": supported,
  "class.iteration.document": supported,

  "statement.class": supported,
  "statement.interface": supported,
  "statement.field.class": supported,
  "statement.field.interface": supported,
  "statement.function": supported,
  "statement.method": supported,
  "statement.if": supported,
  "statement.switch": supported,
  "statement.for": supported,
  "statement.foreach": supported,
  "statement.variable": supported,
  "statement.assignment": supported,
  "statement.return": supported,
  "statement.break": supported,
  "statement.continue": supported,
  "statement.iteration.document": supported,
  "statement.iteration.class": supported,
  "statement.iteration.interface": supported,
  "statement.iteration.block": supported,

  namedFunction: supported,
  "namedFunction.method": supported,
  "namedFunction.iteration.class": supported,
  "namedFunction.iteration.document": supported,
  anonymousFunction: supported,

  functionCall: supported,
  "functionCall.method": supported,
  "functionCall.chain": supported,
  functionCallee: supported,
  "functionCallee.method": supported,
  "functionCallee.chain": supported,

  "argument.actual.singleLine": supported,
  "argument.actual.multiLine": supported,
  "argument.actual.iteration": supported,
  "argument.actual.method.singleLine": supported,
  "argument.actual.method.multiLine": supported,
  "argument.actual.method.iteration": supported,
  "argument.formal.singleLine": supported,
  "argument.formal.multiLine": supported,
  "argument.formal.iteration": supported,
  "argument.formal.method.singleLine": supported,
  "argument.formal.method.multiLine": supported,
  "argument.formal.method.iteration": supported,
  "argument.formal.lambda.singleLine": supported,
  "argument.formal.lambda.multiLine": supported,
  "argument.formal.lambda.iteration": supported,

  "argumentList.actual.empty": supported,
  "argumentList.actual.singleLine": supported,
  "argumentList.actual.multiLine": supported,
  "argumentList.actual.method.empty": supported,
  "argumentList.actual.method.singleLine": supported,
  "argumentList.actual.method.multiLine": supported,
  "argumentList.formal.empty": supported,
  "argumentList.formal.singleLine": supported,
  "argumentList.formal.multiLine": supported,
  "argumentList.formal.lambda.empty": supported,
  "argumentList.formal.lambda.singleLine": supported,
  "argumentList.formal.lambda.multiLine": supported,
  "argumentList.formal.method.empty": supported,
  "argumentList.formal.method.singleLine": supported,
  "argumentList.formal.method.multiLine": supported,

  "comment.line": supported,
  "comment.block": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "textFragment.comment.line": supported,
  "textFragment.comment.block": supported,
  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,

  "branch.if": supported,
  "branch.if.elif.else": supported,
  "branch.if.else": supported,
  "branch.if.iteration": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,

  "collectionItem.unenclosed.singleLine": supported,
  "collectionItem.unenclosed.multiLine": supported,
  "collectionItem.unenclosed.iteration": supported,

  "condition.if": supported,
  "condition.for": supported,
  "condition.switchCase": supported,
  "condition.switchCase.iteration": supported,

  "name.assignment": supported,
  "name.variable": supported,
  "name.foreach": supported,
  "name.function": supported,
  "name.method": supported,
  "name.class": supported,
  "name.interface": supported,
  "name.field.class": supported,
  "name.field.interface": supported,
  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.iteration.block": supported,
  "name.iteration.class": supported,
  "name.iteration.document": supported,
  "name.iteration.interface": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "value.assignment": supported,
  "value.variable": supported,
  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.foreach": supported,
  "value.return": supported,
  "value.switch": supported,
  "value.typeAlias": supported,
  "value.iteration.block": supported,
  "value.iteration.document": supported,

  "type.variable": supported,
  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.argument.formal.method": supported,
  "type.argument.formal.method.iteration": supported,
  "type.return": supported,
  "type.class": supported,
  "type.interface": supported,
  "type.field.class": supported,
  "type.alias": supported,
  "type.typeArgument": supported,
  "type.typeArgument.iteration": supported,
  "type.iteration.block": supported,
  "type.iteration.class": supported,
  "type.iteration.document": supported,

  "interior.class": supported,
  "interior.interface": supported,
  "interior.function": supported,
  "interior.method": supported,
  "interior.lambda": supported,
  "interior.if": supported,
  "interior.switch": supported,
  "interior.switchCase": supported,
  "interior.for": supported,
  "interior.foreach": supported,

  /* UNSUPPORTED */

  fieldAccess: unsupported,

  /* NOT APPLICABLE */

  // Element and tags
  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  "interior.element": notApplicable,
  "textFragment.element": notApplicable,

  // Attributes
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,

  // Section
  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,

  // Command
  command: notApplicable,
  "statement.command": notApplicable,
  "name.command": notApplicable,
  "value.command": notApplicable,
  "interior.command": notApplicable,

  // Class field values
  "value.field.class": notApplicable,
  "value.iteration.class": notApplicable,

  // Enum
  "statement.enum": notApplicable,
  "name.enum": notApplicable,
  "name.field.enum": notApplicable,
  "name.iteration.enum": notApplicable,
  "type.enum": notApplicable,
  "interior.enum": notApplicable,
  "value.field.enum": notApplicable,
  "value.iteration.enum": notApplicable,

  // Constructors
  "statement.constructor": notApplicable,
  "namedFunction.constructor": notApplicable,
  "argument.actual.constructor.singleLine": notApplicable,
  "argument.actual.constructor.multiLine": notApplicable,
  "argument.actual.constructor.iteration": notApplicable,
  "argument.formal.constructor.singleLine": notApplicable,
  "argument.formal.constructor.multiLine": notApplicable,
  "argument.formal.constructor.iteration": notApplicable,
  "argumentList.actual.constructor.empty": notApplicable,
  "argumentList.actual.constructor.singleLine": notApplicable,
  "argumentList.actual.constructor.multiLine": notApplicable,
  "argumentList.formal.constructor.empty": notApplicable,
  "argumentList.formal.constructor.singleLine": notApplicable,
  "argumentList.formal.constructor.multiLine": notApplicable,
  "functionCall.constructor": notApplicable,
  "functionCallee.constructor": notApplicable,
  "name.constructor": notApplicable,
  "name.argument.formal.constructor": notApplicable,
  "name.argument.formal.constructor.iteration": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "value.argument.formal.constructor": notApplicable,
  "value.argument.formal.constructor.iteration": notApplicable,
  "interior.constructor": notApplicable,

  // Namespace
  "statement.namespace": notApplicable,
  "name.namespace": notApplicable,
  "interior.namespace": notApplicable,

  // Try / catch
  "statement.try": notApplicable,
  "branch.try": notApplicable,
  "branch.try.iteration": notApplicable,
  "interior.try": notApplicable,
  "argument.catch": notApplicable,
  "name.argument.catch": notApplicable,
  "type.argument.catch": notApplicable,

  // Loop types
  "statement.while": notApplicable,
  "condition.while": notApplicable,
  "interior.while": notApplicable,
  "statement.doWhile": notApplicable,
  "condition.doWhile": notApplicable,
  "interior.doWhile": notApplicable,
  "branch.loop": notApplicable,
  "branch.loop.iteration": notApplicable,

  // Ternary
  "branch.ternary": notApplicable,
  "branch.ternary.iteration": notApplicable,
  "condition.ternary": notApplicable,

  // Resource syntax
  "statement.resource": notApplicable,
  "name.resource": notApplicable,
  "name.resource.iteration": notApplicable,
  "value.resource": notApplicable,
  "value.resource.iteration": notApplicable,
  "type.resource": notApplicable,
  "type.resource.iteration": notApplicable,
  "interior.resource": notApplicable,

  // Static
  "statement.static": notApplicable,
  "interior.static": notApplicable,

  // Keyword arguments
  "name.argument.actual": notApplicable,
  "name.argument.actual.iteration": notApplicable,
  "value.argument.actual": notApplicable,
  "value.argument.actual.iteration": notApplicable,

  // Default parameter values
  "value.argument.formal": notApplicable,
  "value.argument.formal.iteration": notApplicable,
  "value.argument.formal.method": notApplicable,
  "value.argument.formal.method.iteration": notApplicable,

  // Yield
  "statement.yield": notApplicable,
  "value.yield": notApplicable,

  // Notebook cell
  notebookCell: notApplicable,
  "interior.cell": notApplicable,

  // Interface field types
  "type.field.interface": notApplicable,
  "type.iteration.interface": notApplicable,

  // Miscellaneous
  "statement.misc": notApplicable,
  "name.assignment.pattern": notApplicable,
  "name.variable.pattern": notApplicable,
  "value.variable.pattern": notApplicable,
  "value.return.lambda": notApplicable,
  "type.foreach": notApplicable,
  "type.cast": notApplicable,
  regularExpression: notApplicable,
  selector: notApplicable,
  unit: notApplicable,
  pairDelimiter: notApplicable,
  environment: notApplicable,
};
