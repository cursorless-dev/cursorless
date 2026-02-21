import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const rubyScopeSupport: LanguageScopeSupportFacetMap = {
  disqualifyDelimiter: supported,
  list: supported,
  map: supported,
  regularExpression: supported,
  ifStatement: supported,
  anonymousFunction: supported,

  class: supported,
  "class.iteration.class": supported,
  "class.iteration.document": supported,

  namedFunction: supported,
  "namedFunction.method": supported,
  "namedFunction.iteration.document": supported,
  "namedFunction.iteration.class": supported,

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

  "branch.if": supported,
  "branch.if.elif.else": supported,
  "branch.if.else": supported,
  "branch.if.iteration": supported,
  "branch.try": supported,
  "branch.try.iteration": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": supported,
  "branch.ternary.iteration": supported,

  "comment.block": supported,
  "comment.line": supported,

  "condition.if": supported,
  "condition.while": supported,
  "condition.switchCase": supported,
  "condition.switchCase.iteration": supported,
  "condition.ternary": supported,

  "statement.class": supported,
  "statement.function": supported,
  "statement.method": supported,
  "statement.functionCall": supported,
  "statement.if": supported,
  "statement.try": supported,
  "statement.switch": supported,
  "statement.foreach": supported,
  "statement.while": supported,
  "statement.assignment": supported,
  "statement.variable.initialized": supported,
  "statement.return": supported,
  "statement.yield": supported,
  "statement.throw": supported,
  "statement.break": supported,
  "statement.continue": supported,
  "statement.misc": supported,
  "statement.iteration.document": supported,
  "statement.iteration.class": supported,
  "statement.iteration.block": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "textFragment.comment.block": supported,
  "textFragment.comment.line": supported,
  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,

  "name.argument.actual": supported,
  "name.argument.actual.iteration": supported,
  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.argument.formal.lambda": supported,
  "name.argument.formal.lambda.iteration": supported,
  "name.assignment": supported,
  "name.foreach": supported,
  "name.function": supported,
  "name.method": supported,
  "name.class": supported,
  "name.iteration.document": supported,
  "name.iteration.class": supported,
  "name.iteration.block": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "value.argument.actual": supported,
  "value.argument.actual.iteration": supported,
  "value.argument.formal": supported,
  "value.argument.formal.iteration": supported,
  "value.argument.formal.method": supported,
  "value.argument.formal.method.iteration": supported,
  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.assignment": supported,
  "value.foreach": supported,
  "value.return": supported,
  "value.return.lambda": supported,
  "value.yield": supported,
  "value.throw": supported,
  "value.switch": supported,
  "value.variable": supported,
  "value.iteration.document": supported,
  "value.iteration.class": supported,
  "value.iteration.block": supported,

  "interior.class": supported,
  "interior.function": supported,
  "interior.method": supported,
  "interior.lambda": supported,
  "interior.if": supported,
  "interior.try": supported,
  "interior.switch": supported,
  "interior.switchCase": supported,
  "interior.foreach": supported,
  "interior.while": supported,

  /* UNSUPPORTED  */
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

  // Class fields
  "statement.field.class": notApplicable,
  "name.field.class": notApplicable,
  "type.class": notApplicable,
  "type.field.class": notApplicable,
  "type.iteration.class": notApplicable,
  "value.field.class": notApplicable,

  // Interface
  "statement.interface": notApplicable,
  "statement.field.interface": notApplicable,
  "statement.iteration.interface": notApplicable,
  "name.interface": notApplicable,
  "name.field.interface": notApplicable,
  "name.iteration.interface": notApplicable,
  "type.interface": notApplicable,
  "type.field.interface": notApplicable,
  "type.iteration.interface": notApplicable,
  "value.field.interface": notApplicable,
  "interior.interface": notApplicable,

  // Enum
  "statement.enum": notApplicable,
  "name.enum": notApplicable,
  "name.field.enum": notApplicable,
  "name.iteration.enum": notApplicable,
  "type.enum": notApplicable,
  "value.field.enum": notApplicable,
  "value.iteration.enum": notApplicable,
  "interior.enum": notApplicable,
  "functionCall.enum": notApplicable,
  "functionCallee.enum": notApplicable,

  // Type system
  "type.argument.formal": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.argument.formal.lambda": notApplicable,
  "type.argument.formal.lambda.iteration": notApplicable,
  "type.return": notApplicable,
  "type.return.method": notApplicable,
  "type.variable.uninitialized": notApplicable,
  "type.variable.initialized": notApplicable,
  "type.typeArgument": notApplicable,
  "type.typeArgument.iteration": notApplicable,
  "type.cast": notApplicable,
  "type.foreach": notApplicable,
  "type.iteration.block": notApplicable,
  "type.iteration.document": notApplicable,

  // Type alias
  "type.alias": notApplicable,
  "statement.typeAlias": notApplicable,
  "name.typeAlias": notApplicable,
  "value.typeAlias": notApplicable,

  // Assignment variants not covered
  "statement.assignment.destructuring": notApplicable,
  "statement.assignment.compound": notApplicable,
  "statement.update": notApplicable,
  "name.assignment.destructuring": notApplicable,
  "name.assignment.compound": notApplicable,
  "value.assignment.destructuring": notApplicable,
  "value.assignment.compound": notApplicable,

  // Variable declarations
  "statement.variable.uninitialized": notApplicable,
  "statement.variable.destructuring": notApplicable,
  "name.variable.uninitialized": notApplicable,
  "name.variable.initialized": notApplicable,
  "name.variable.destructuring": notApplicable,
  "value.variable.destructuring": notApplicable,

  // Constant declaration scopes
  "statement.constant": notApplicable,
  "name.constant": notApplicable,
  "value.constant": notApplicable,
  "type.constant": notApplicable,

  // Catch parameter
  "argument.catch": notApplicable,
  "name.argument.catch": notApplicable,
  "type.argument.catch": notApplicable,

  // Loop branches
  "branch.loop": notApplicable,
  "branch.loop.iteration": notApplicable,

  // Do while
  "statement.doWhile": notApplicable,
  "condition.doWhile": notApplicable,
  "interior.doWhile": notApplicable,

  // Resources
  "statement.resource": notApplicable,
  "name.resource": notApplicable,
  "value.resource": notApplicable,
  "type.resource": notApplicable,
  "interior.resource": notApplicable,

  // Namespace
  "statement.namespace": notApplicable,
  "name.namespace": notApplicable,
  "interior.namespace": notApplicable,

  // Generic calls
  "functionCall.generic": notApplicable,
  "functionCallee.generic": notApplicable,

  // Static
  "statement.static": notApplicable,
  "interior.static": notApplicable,

  // Command
  command: notApplicable,
  "statement.command": notApplicable,
  "name.command": notApplicable,
  "value.command": notApplicable,
  "interior.command": notApplicable,

  // Section
  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,

  // Elements
  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  "interior.element": notApplicable,
  "textFragment.element": notApplicable,
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,

  // Notebook cell
  notebookCell: notApplicable,
  "interior.cell": notApplicable,

  // Unenclosed collection items
  "collectionItem.unenclosed.singleLine": notApplicable,
  "collectionItem.unenclosed.multiLine": notApplicable,
  "collectionItem.unenclosed.iteration": notApplicable,

  // For loop
  "statement.for": notApplicable,
  "condition.for": notApplicable,
  "interior.for": notApplicable,

  // Misc
  "statement.package": notApplicable,
  "statement.import": notApplicable,
  pairDelimiter: notApplicable,
  environment: notApplicable,
  selector: notApplicable,
  unit: notApplicable,
};
