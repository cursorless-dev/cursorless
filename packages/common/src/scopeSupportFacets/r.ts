import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const rScopeSupport: LanguageScopeSupportFacetMap = {
  disqualifyDelimiter: supported,
  anonymousFunction: supported,
  list: supported,

  "argument.actual.singleLine": supported,
  "argument.actual.multiLine": supported,
  "argument.actual.iteration": supported,
  "argument.actual.method.singleLine": supported,
  "argument.actual.method.multiLine": supported,
  "argument.actual.method.iteration": supported,
  "argument.formal.singleLine": supported,
  "argument.formal.multiLine": supported,
  "argument.formal.iteration": supported,
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

  "branch.if": supported,
  "branch.if.elif.else": supported,
  "branch.if.else": supported,
  "branch.if.iteration": supported,
  "branch.try": supported,
  "branch.try.iteration": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,

  "comment.line": supported,

  "condition.if": supported,
  "condition.while": supported,
  "condition.switchCase": supported,
  "condition.switchCase.iteration": supported,

  functionCall: supported,
  "functionCall.method": supported,
  functionCallee: supported,
  "functionCallee.method": supported,

  ifStatement: supported,

  "statement.function": supported,
  "statement.functionCall": supported,
  "statement.if": supported,
  "statement.try": supported,
  "statement.switch": supported,
  "statement.foreach": supported,
  "statement.while": supported,
  "statement.assignment": supported,
  "statement.variable.initialized": supported,
  "statement.return": supported,
  "statement.break": supported,
  "statement.continue": supported,
  "statement.iteration.document": supported,
  "statement.iteration.block": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "textFragment.comment.line": supported,
  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,

  "name.argument.actual": supported,
  "name.argument.actual.iteration": supported,
  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.lambda": supported,
  "name.argument.formal.lambda.iteration": supported,
  "name.assignment": supported,
  "name.function": supported,
  "name.variable.initialized": supported,
  "name.foreach": supported,
  "name.iteration.document": supported,
  "name.iteration.block": supported,

  namedFunction: supported,
  "namedFunction.iteration.document": supported,

  "value.argument.actual": supported,
  "value.argument.actual.iteration": supported,
  "value.argument.formal": supported,
  "value.argument.formal.iteration": supported,
  "value.assignment": supported,
  "value.foreach": supported,
  "value.return": supported,
  "value.switch": supported,
  "value.variable": supported,
  "value.iteration.document": supported,
  "value.iteration.block": supported,

  "interior.function": supported,
  "interior.lambda": supported,
  "interior.if": supported,
  "interior.try": supported,
  "interior.switchCase": supported,
  "interior.foreach": supported,
  "interior.while": supported,

  /* UNSUPPORTED  */

  fieldAccess: unsupported,

  /* NOT APPLICABLE */

  // Assignment
  "statement.assignment.compound": notApplicable,
  "statement.assignment.destructuring": notApplicable,
  "name.assignment.compound": notApplicable,
  "name.assignment.destructuring": notApplicable,
  "value.assignment.compound": notApplicable,
  "value.assignment.destructuring": notApplicable,
  "statement.update": notApplicable,

  // Variable
  "statement.variable.uninitialized": notApplicable,
  "statement.variable.destructuring": notApplicable,
  "name.variable.uninitialized": notApplicable,
  "name.variable.destructuring": notApplicable,
  "type.variable.uninitialized": notApplicable,
  "type.variable.initialized": notApplicable,
  "value.variable.destructuring": notApplicable,

  // Constant
  "statement.constant": notApplicable,
  "name.constant": notApplicable,
  "value.constant": notApplicable,
  "type.constant": notApplicable,

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
  "value.field.class": notApplicable,
  "value.iteration.class": notApplicable,
  "type.class": notApplicable,
  "type.field.class": notApplicable,
  "type.iteration.class": notApplicable,
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
  "argument.formal.method.singleLine": notApplicable,
  "argument.formal.method.multiLine": notApplicable,
  "argument.formal.method.iteration": notApplicable,
  "argumentList.formal.method.empty": notApplicable,
  "argumentList.formal.method.singleLine": notApplicable,
  "argumentList.formal.method.multiLine": notApplicable,
  "interior.method": notApplicable,
  "name.argument.formal.method": notApplicable,
  "name.argument.formal.method.iteration": notApplicable,
  "name.method": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.return.method": notApplicable,
  "value.argument.formal.method": notApplicable,
  "value.argument.formal.method.iteration": notApplicable,

  // Function (class-contained variants)
  "namedFunction.iteration.class": notApplicable,

  // Catch parameter
  "argument.catch": notApplicable,
  "name.argument.catch": notApplicable,
  "type.argument.catch": notApplicable,

  // Type
  "type.argument.formal": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.argument.formal.lambda": notApplicable,
  "type.argument.formal.lambda.iteration": notApplicable,
  "type.return": notApplicable,
  "type.foreach": notApplicable,
  "type.resource": notApplicable,
  "type.typeArgument": notApplicable,
  "type.typeArgument.iteration": notApplicable,
  "type.cast": notApplicable,
  "type.iteration.block": notApplicable,
  "type.iteration.document": notApplicable,

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
  "value.field.interface": notApplicable,
  "type.iteration.interface": notApplicable,

  // Enum
  "statement.enum": notApplicable,
  "functionCallee.enum": notApplicable,
  "functionCall.enum": notApplicable,
  "name.enum": notApplicable,
  "name.field.enum": notApplicable,
  "name.iteration.enum": notApplicable,
  "value.field.enum": notApplicable,
  "value.iteration.enum": notApplicable,
  "type.enum": notApplicable,
  "interior.enum": notApplicable,

  // Function call
  "functionCall.chain": notApplicable,
  "functionCallee.chain": notApplicable,
  "functionCall.generic": notApplicable,
  "functionCallee.generic": notApplicable,

  // Return statement
  "value.return.lambda": notApplicable,

  // Yield statement
  "statement.yield": notApplicable,
  "value.yield": notApplicable,

  // Throw statement
  "statement.throw": notApplicable,
  "value.throw": notApplicable,

  // Loop
  "branch.loop": notApplicable,
  "branch.loop.iteration": notApplicable,

  // For loop
  "statement.for": notApplicable,
  "condition.for": notApplicable,
  "interior.for": notApplicable,

  // While loop branch not applicable in R
  "statement.doWhile": notApplicable,
  "condition.doWhile": notApplicable,
  "interior.doWhile": notApplicable,

  // Resource statement
  "statement.resource": notApplicable,
  "interior.resource": notApplicable,
  "name.resource": notApplicable,
  "value.resource": notApplicable,

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

  // Type alias
  "type.alias": notApplicable,
  "statement.typeAlias": notApplicable,
  "name.typeAlias": notApplicable,
  "value.typeAlias": notApplicable,

  // Map
  map: notApplicable,
  "key.mapPair": notApplicable,
  "key.mapPair.iteration": notApplicable,
  "value.mapPair": notApplicable,
  "value.mapPair.iteration": notApplicable,

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

  // Command
  command: notApplicable,
  "statement.command": notApplicable,
  "name.command": notApplicable,
  "value.command": notApplicable,
  "interior.command": notApplicable,

  // Notebook cell
  notebookCell: notApplicable,
  "interior.cell": notApplicable,

  // Unenclosed collection items
  "collectionItem.unenclosed.singleLine": notApplicable,
  "collectionItem.unenclosed.multiLine": notApplicable,
  "collectionItem.unenclosed.iteration": notApplicable,

  // Miscellaneous statements
  "statement.misc": notApplicable,
  "statement.package": notApplicable,
  "statement.import": notApplicable,

  // Miscellaneous
  "comment.block": notApplicable,
  "textFragment.comment.block": notApplicable,
  "interior.switch": notApplicable,
  environment: notApplicable,
  pairDelimiter: notApplicable,
  regularExpression: notApplicable,
  selector: notApplicable,
  unit: notApplicable,
};
