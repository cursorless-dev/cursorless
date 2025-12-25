import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const luaScopeSupport: LanguageScopeSupportFacetMap = {
  disqualifyDelimiter: supported,
  pairDelimiter: supported,
  list: supported,
  map: supported,
  ifStatement: supported,
  anonymousFunction: supported,

  namedFunction: supported,
  "namedFunction.method": supported,
  "namedFunction.iteration.document": supported,

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

  "name.assignment": supported,
  "name.assignment.pattern": supported,
  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.foreach": supported,
  "name.function": supported,
  "name.method": supported,
  "name.variable": supported,
  "name.iteration.block": supported,
  "name.iteration.document": supported,

  "value.assignment": supported,
  "value.foreach": supported,
  "value.return": supported,
  "value.variable": supported,
  "value.iteration.block": supported,
  "value.iteration.document": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,
  "value.mapPair": supported,
  "value.mapPair.iteration": supported,

  "branch.if": supported,
  "branch.if.elif.else": supported,
  "branch.if.else": supported,
  "branch.if.iteration": supported,

  "collectionItem.unenclosed.singleLine": supported,
  "collectionItem.unenclosed.multiLine": supported,
  "collectionItem.unenclosed.iteration": supported,

  "comment.block": supported,
  "comment.line": supported,

  "condition.if": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.for": supported,

  "statement.function": supported,
  "statement.method": supported,
  "statement.if": supported,
  "statement.while": supported,
  "statement.doWhile": supported,
  "statement.for": supported,
  "statement.foreach": supported,
  "statement.variable": supported,
  "statement.assignment": supported,
  "statement.return": supported,
  "statement.break": supported,
  "statement.iteration.document": supported,
  "statement.iteration.block": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "textFragment.comment.block": supported,
  "textFragment.comment.line": supported,
  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,

  "interior.function": supported,
  "interior.method": supported,
  "interior.lambda": supported,
  "interior.if": supported,
  "interior.while": supported,
  "interior.doWhile": supported,
  "interior.for": supported,
  "interior.foreach": supported,

  /* UNSUPPORTED */

  fieldAccess: unsupported,

  /* NOT APPLICABLE */

  // Constructors
  "namedFunction.constructor": notApplicable,
  "statement.constructor": notApplicable,
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
  "name.argument.formal.constructor": notApplicable,
  "name.argument.formal.constructor.iteration": notApplicable,
  "name.constructor": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "value.argument.formal.constructor": notApplicable,
  "value.argument.formal.constructor.iteration": notApplicable,
  "interior.constructor": notApplicable,

  // Class
  class: notApplicable,
  "class.iteration.document": notApplicable,
  "class.iteration.block": notApplicable,
  "statement.class": notApplicable,
  "statement.field.class": notApplicable,
  "statement.continue": notApplicable,
  "name.class": notApplicable,
  "name.field.class": notApplicable,
  "name.iteration.class": notApplicable,
  "type.class": notApplicable,
  "type.field.class": notApplicable,
  "interior.class": notApplicable,
  "statement.iteration.class": notApplicable,
  "namedFunction.iteration.class": notApplicable,

  // Interface
  "statement.interface": notApplicable,
  "statement.field.interface": notApplicable,
  "name.interface": notApplicable,
  "name.field.interface": notApplicable,
  "name.iteration.interface": notApplicable,
  "type.interface": notApplicable,
  "type.field.interface": notApplicable,
  "interior.interface": notApplicable,
  "statement.iteration.interface": notApplicable,

  // Enum
  "statement.enum": notApplicable,
  "name.enum": notApplicable,
  "name.field.enum": notApplicable,
  "name.iteration.enum": notApplicable,
  "type.enum": notApplicable,
  "interior.enum": notApplicable,

  // Types and type annotations
  "type.argument.formal": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.argument.catch": notApplicable,
  "type.return": notApplicable,
  "type.variable": notApplicable,
  "type.typeArgument": notApplicable,
  "type.typeArgument.iteration": notApplicable,
  "type.alias": notApplicable,
  "type.cast": notApplicable,
  "type.foreach": notApplicable,
  "type.iteration.block": notApplicable,
  "type.iteration.class": notApplicable,
  "type.iteration.interface": notApplicable,
  "type.iteration.document": notApplicable,

  // Element and tags
  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  "interior.element": notApplicable,
  "textFragment.element": notApplicable,
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

  // Resource syntax
  "statement.resource": notApplicable,
  "name.resource": notApplicable,
  "name.resource.iteration": notApplicable,
  "value.resource": notApplicable,
  "value.resource.iteration": notApplicable,
  "type.resource": notApplicable,
  "type.resource.iteration": notApplicable,
  "interior.resource": notApplicable,

  // Keyword argument
  "name.argument.actual": notApplicable,
  "name.argument.actual.iteration": notApplicable,
  "value.argument.actual": notApplicable,
  "value.argument.actual.iteration": notApplicable,

  // Default argument value
  "value.argument.formal": notApplicable,
  "value.argument.formal.iteration": notApplicable,
  "value.argument.formal.method": notApplicable,
  "value.argument.formal.method.iteration": notApplicable,
  "value.typeAlias": notApplicable,
  "value.switch": notApplicable,
  "value.field.class": notApplicable,
  "value.field.enum": notApplicable,
  "value.iteration.class": notApplicable,
  "value.iteration.enum": notApplicable,

  // Try / catch
  "statement.try": notApplicable,
  "branch.try": notApplicable,
  "branch.try.iteration": notApplicable,
  "interior.try": notApplicable,
  "argument.catch": notApplicable,
  "name.argument.catch": notApplicable,

  // Switch
  "statement.switch": notApplicable,
  "branch.switchCase": notApplicable,
  "branch.switchCase.iteration": notApplicable,
  "condition.switchCase": notApplicable,
  "condition.switchCase.iteration": notApplicable,
  "interior.switch": notApplicable,
  "interior.switchCase": notApplicable,

  // Ternary
  "branch.ternary": notApplicable,
  "branch.ternary.iteration": notApplicable,
  "condition.ternary": notApplicable,

  // Loop branches
  "branch.loop": notApplicable,
  "branch.loop.iteration": notApplicable,

  // Yield
  "statement.yield": notApplicable,
  "value.yield": notApplicable,
  "value.return.lambda": notApplicable,

  // Namespace
  "statement.namespace": notApplicable,
  "name.namespace": notApplicable,
  "interior.namespace": notApplicable,

  // Static
  "statement.static": notApplicable,
  "interior.static": notApplicable,

  // Notebook cell
  notebookCell: notApplicable,
  "interior.cell": notApplicable,

  // Miscellaneous
  "statement.misc": notApplicable,
  environment: notApplicable,
  regularExpression: notApplicable,
  selector: notApplicable,
  unit: notApplicable,
};
