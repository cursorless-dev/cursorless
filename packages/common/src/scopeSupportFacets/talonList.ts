import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const talonListScopeSupport: LanguageScopeSupportFacetMap = {
  "statement.variable": supported,
  "statement.iteration.document": supported,

  "name.variable": supported,
  "name.iteration.document": supported,

  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.variable": supported,
  "value.iteration.document": supported,

  "string.singleLine": supported,
  "textFragment.string.singleLine": supported,

  "comment.line": supported,
  "textFragment.comment.line": supported,

  /* NOT APPLICABLE */

  // Class
  class: notApplicable,
  "class.iteration.block": notApplicable,
  "class.iteration.document": notApplicable,
  "name.class": notApplicable,
  "name.field.class": notApplicable,
  "name.iteration.class": notApplicable,
  "statement.class": notApplicable,
  "statement.field.class": notApplicable,
  "statement.iteration.class": notApplicable,
  "type.class": notApplicable,
  "type.field.class": notApplicable,
  "type.iteration.class": notApplicable,
  "value.field.class": notApplicable,
  "value.iteration.class": notApplicable,
  "interior.class": notApplicable,

  // Constructor
  "statement.constructor": notApplicable,
  "namedFunction.constructor": notApplicable,
  "functionCall.constructor": notApplicable,
  "functionCallee.constructor": notApplicable,
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
  "interior.constructor": notApplicable,
  "name.argument.formal.constructor": notApplicable,
  "name.argument.formal.constructor.iteration": notApplicable,
  "name.constructor": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "value.argument.formal.constructor": notApplicable,
  "value.argument.formal.constructor.iteration": notApplicable,

  // Method
  "statement.method": notApplicable,
  "namedFunction.method": notApplicable,
  "argument.actual.method.singleLine": notApplicable,
  "argument.actual.method.multiLine": notApplicable,
  "argument.actual.method.iteration": notApplicable,
  "argument.formal.method.singleLine": notApplicable,
  "argument.formal.method.multiLine": notApplicable,
  "argument.formal.method.iteration": notApplicable,
  "argumentList.actual.method.multiLine": notApplicable,
  "argumentList.actual.method.singleLine": notApplicable,
  "argumentList.actual.method.empty": notApplicable,
  "argumentList.formal.method.empty": notApplicable,
  "argumentList.formal.method.singleLine": notApplicable,
  "argumentList.formal.method.multiLine": notApplicable,
  "interior.method": notApplicable,
  "name.argument.formal.method": notApplicable,
  "name.argument.formal.method.iteration": notApplicable,
  "name.method": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "value.argument.formal.method": notApplicable,
  "value.argument.formal.method.iteration": notApplicable,
  "functionCall.method": notApplicable,
  "functionCallee.method": notApplicable,

  // Function
  namedFunction: notApplicable,
  "namedFunction.iteration.document": notApplicable,
  "namedFunction.iteration.class": notApplicable,
  "statement.function": notApplicable,
  "name.function": notApplicable,
  "interior.function": notApplicable,
  "argument.actual.iteration": notApplicable,
  "argument.actual.singleLine": notApplicable,
  "argument.actual.multiLine": notApplicable,
  "argumentList.actual.empty": notApplicable,
  "argumentList.actual.singleLine": notApplicable,
  "argumentList.actual.multiLine": notApplicable,
  "argumentList.formal.empty": notApplicable,
  "argumentList.formal.singleLine": notApplicable,
  "argumentList.formal.multiLine": notApplicable,
  "argument.formal.singleLine": notApplicable,
  "argument.formal.multiLine": notApplicable,
  "argument.formal.iteration": notApplicable,
  "name.argument.formal": notApplicable,
  "name.argument.formal.iteration": notApplicable,
  "type.argument.formal": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "value.argument.formal": notApplicable,
  "value.argument.formal.iteration": notApplicable,
  functionCall: notApplicable,
  functionCallee: notApplicable,
  "functionCall.chain": notApplicable,
  "functionCallee.chain": notApplicable,

  // Anonymous function / lambda
  anonymousFunction: notApplicable,
  "argumentList.formal.lambda.empty": notApplicable,
  "argumentList.formal.lambda.singleLine": notApplicable,
  "argumentList.formal.lambda.multiLine": notApplicable,
  "argument.formal.lambda.singleLine": notApplicable,
  "argument.formal.lambda.multiLine": notApplicable,
  "argument.formal.lambda.iteration": notApplicable,
  "value.return.lambda": notApplicable,
  "interior.lambda": notApplicable,

  // Keyword argument
  "name.argument.actual": notApplicable,
  "name.argument.actual.iteration": notApplicable,
  "value.argument.actual": notApplicable,
  "value.argument.actual.iteration": notApplicable,

  // Return statement
  "statement.return": notApplicable,
  "type.return": notApplicable,
  "value.return": notApplicable,

  // Yield statement
  "statement.yield": notApplicable,
  "value.yield": notApplicable,

  // Interface
  "statement.interface": notApplicable,
  "statement.field.interface": notApplicable,
  "statement.iteration.interface": notApplicable,
  "interior.interface": notApplicable,
  "name.interface": notApplicable,
  "name.field.interface": notApplicable,
  "name.iteration.interface": notApplicable,
  "type.interface": notApplicable,
  "type.field.interface": notApplicable,
  "type.iteration.interface": notApplicable,

  // Enum
  "statement.enum": notApplicable,
  "name.enum": notApplicable,
  "name.field.enum": notApplicable,
  "name.iteration.enum": notApplicable,
  "value.field.enum": notApplicable,
  "value.iteration.enum": notApplicable,
  "type.enum": notApplicable,
  "interior.enum": notApplicable,

  // Try catch
  "statement.try": notApplicable,
  "branch.try": notApplicable,
  "branch.try.iteration": notApplicable,
  "interior.try": notApplicable,
  "argument.catch": notApplicable,
  "name.argument.catch": notApplicable,
  "type.argument.catch": notApplicable,

  // If statement
  ifStatement: notApplicable,
  "statement.if": notApplicable,
  "branch.if": notApplicable,
  "branch.if.elif.else": notApplicable,
  "branch.if.else": notApplicable,
  "branch.if.iteration": notApplicable,
  "condition.if": notApplicable,
  "interior.if": notApplicable,

  // Switch statement
  "statement.switch": notApplicable,
  "branch.switchCase": notApplicable,
  "branch.switchCase.iteration": notApplicable,
  "condition.switchCase": notApplicable,
  "condition.switchCase.iteration": notApplicable,
  "interior.switch": notApplicable,
  "interior.switchCase": notApplicable,
  "value.switch": notApplicable,

  // Loop
  "branch.loop": notApplicable,
  "branch.loop.iteration": notApplicable,

  // For loop
  "statement.for": notApplicable,
  "condition.for": notApplicable,
  "interior.for": notApplicable,

  // For-each loop
  "statement.foreach": notApplicable,
  "interior.foreach": notApplicable,
  "name.foreach": notApplicable,
  "type.foreach": notApplicable,
  "value.foreach": notApplicable,

  // While loop
  "statement.while": notApplicable,
  "condition.while": notApplicable,
  "interior.while": notApplicable,

  // Do-while loop
  "statement.doWhile": notApplicable,
  "condition.doWhile": notApplicable,
  "interior.doWhile": notApplicable,

  // Resource statement
  "statement.resource": notApplicable,
  "interior.resource": notApplicable,
  "name.resource": notApplicable,
  "name.resource.iteration": notApplicable,
  "type.resource": notApplicable,
  "type.resource.iteration": notApplicable,
  "value.resource": notApplicable,
  "value.resource.iteration": notApplicable,

  // Pattern destruction
  "name.assignment.pattern": notApplicable,
  "name.variable.pattern": notApplicable,
  "value.variable.pattern": notApplicable,

  // String
  "string.multiLine": notApplicable,
  "textFragment.string.multiLine": notApplicable,

  // Block comment
  "comment.block": notApplicable,
  "textFragment.comment.block": notApplicable,

  // Static
  "statement.static": notApplicable,
  "interior.static": notApplicable,

  // Namespace
  "statement.namespace": notApplicable,
  "interior.namespace": notApplicable,
  "name.namespace": notApplicable,

  // Ternary
  "branch.ternary": notApplicable,
  "branch.ternary.iteration": notApplicable,
  "condition.ternary": notApplicable,

  // Section
  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,

  // Element
  element: notApplicable,
  "interior.element": notApplicable,
  "textFragment.element": notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,

  // Attribute
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,

  // Notebook cell
  notebookCell: notApplicable,
  "interior.cell": notApplicable,

  // Type alias
  "type.alias": notApplicable,
  "value.typeAlias": notApplicable,

  // Collection item
  "collectionItem.unenclosed.singleLine": notApplicable,
  "collectionItem.unenclosed.multiLine": notApplicable,
  "collectionItem.unenclosed.iteration": notApplicable,

  // Command
  command: notApplicable,
  "statement.command": notApplicable,
  "name.command": notApplicable,
  "value.command": notApplicable,
  "interior.command": notApplicable,

  // Assignment
  "statement.assignment": notApplicable,
  "name.assignment": notApplicable,
  "value.assignment": notApplicable,

  // Block
  "name.iteration.block": notApplicable,
  "value.iteration.block": notApplicable,
  "statement.iteration.block": notApplicable,

  // Miscellaneous statements
  "statement.break": notApplicable,
  "statement.continue": notApplicable,

  // Miscellaneous
  "statement.misc": notApplicable,
  "type.cast": notApplicable,
  "type.iteration.block": notApplicable,
  "type.iteration.document": notApplicable,
  "type.typeArgument.iteration": notApplicable,
  "type.typeArgument": notApplicable,
  "type.variable": notApplicable,
  disqualifyDelimiter: notApplicable,
  environment: notApplicable,
  fieldAccess: notApplicable,
  list: notApplicable,
  map: notApplicable,
  pairDelimiter: notApplicable,
  regularExpression: notApplicable,
  selector: notApplicable,
  unit: notApplicable,
};
