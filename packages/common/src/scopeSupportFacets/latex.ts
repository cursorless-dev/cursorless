import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const latexScopeSupport: LanguageScopeSupportFacetMap = {
  "comment.line": supported,
  "comment.block": supported,
  "textFragment.comment.line": supported,
  "textFragment.comment.block": supported,

  element: supported,
  startTag: supported,
  endTag: supported,
  tags: supported,
  environment: supported,
  "interior.element": supported,
  "textFragment.element": supported,

  section: supported,
  "section.iteration.document": supported,

  list: supported,
  "collectionItem.unenclosed.multiLine": supported,
  "collectionItem.unenclosed.iteration": supported,

  functionCall: supported,
  functionCallee: supported,
  "argument.actual.singleLine": supported,
  "argument.actual.multiLine": supported,
  "argument.actual.iteration": supported,

  disqualifyDelimiter: supported,

  /* NOT APPLICABLE */

  // Variable
  "statement.variable": notApplicable,
  "statement.assignment": notApplicable,
  "name.assignment": notApplicable,
  "name.assignment.pattern": notApplicable,
  "name.variable": notApplicable,
  "name.variable.pattern": notApplicable,
  "type.variable": notApplicable,
  "value.assignment": notApplicable,
  "value.variable": notApplicable,
  "value.variable.pattern": notApplicable,

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
  "functionCall.constructor": notApplicable,
  "functionCallee.constructor": notApplicable,

  // Method
  "statement.method": notApplicable,
  "namedFunction.method": notApplicable,
  "argument.actual.method.singleLine": notApplicable,
  "argument.actual.method.multiLine": notApplicable,
  "argument.actual.method.iteration": notApplicable,
  "argument.formal.method.singleLine": notApplicable,
  "argument.formal.method.multiLine": notApplicable,
  "argument.formal.method.iteration": notApplicable,
  "argumentList.actual.method.empty": notApplicable,
  "argumentList.actual.method.singleLine": notApplicable,
  "argumentList.actual.method.multiLine": notApplicable,
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

  // Function call
  "functionCall.chain": notApplicable,
  "functionCallee.chain": notApplicable,
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

  // Command
  command: notApplicable,
  "statement.command": notApplicable,
  "name.command": notApplicable,
  "value.command": notApplicable,
  "interior.command": notApplicable,

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

  // String
  "string.singleLine": notApplicable,
  "textFragment.string.singleLine": notApplicable,
  "string.multiLine": notApplicable,
  "textFragment.string.multiLine": notApplicable,

  // Map
  map: notApplicable,
  "key.mapPair": notApplicable,
  "key.mapPair.iteration": notApplicable,
  "value.mapPair": notApplicable,
  "value.mapPair.iteration": notApplicable,

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

  // Miscellaneous statements
  "statement.break": notApplicable,
  "statement.continue": notApplicable,
  "statement.misc": notApplicable,
  "statement.iteration.document": notApplicable,
  "statement.iteration.block": notApplicable,

  // Argument list. Even though latex have arguments, finding a definition for the argument list is problematic.
  "argumentList.actual.empty": notApplicable,
  "argumentList.actual.singleLine": notApplicable,
  "argumentList.actual.multiLine": notApplicable,

  // Miscellaneous
  fieldAccess: notApplicable,
  "name.iteration.block": notApplicable,
  "name.iteration.document": notApplicable,
  pairDelimiter: notApplicable,
  regularExpression: notApplicable,
  "type.cast": notApplicable,
  "type.typeArgument": notApplicable,
  "type.typeArgument.iteration": notApplicable,
  "type.iteration.block": notApplicable,
  "type.iteration.document": notApplicable,
  "value.iteration.block": notApplicable,
  "value.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,
  "collectionItem.unenclosed.singleLine": notApplicable,
  selector: notApplicable,
  unit: notApplicable,
};
