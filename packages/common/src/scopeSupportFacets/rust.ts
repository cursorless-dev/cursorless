import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const rustScopeSupport: LanguageScopeSupportFacetMap = {
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
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,

  class: supported,
  "class.iteration.document": supported,

  "comment.block": supported,
  "comment.line": supported,

  "condition.if": supported,
  "condition.switchCase": supported,
  "condition.switchCase.iteration": supported,
  "condition.while": supported,

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

  ifStatement: supported,

  "statement.class": supported,
  "statement.enum": supported,
  "statement.field.class": supported,
  "statement.function": supported,
  "statement.method": supported,
  "statement.if": supported,
  "statement.switch": supported,
  "statement.foreach": supported,
  "statement.while": supported,
  "statement.variable": supported,
  "statement.assignment": supported,
  "statement.return": supported,
  "statement.break": supported,
  "statement.continue": supported,
  "statement.namespace": supported,
  "statement.iteration.document": supported,
  "statement.iteration.class": supported,
  "statement.iteration.block": supported,

  "string.singleLine": supported,
  "string.multiLine": supported,

  "textFragment.comment.block": supported,
  "textFragment.comment.line": supported,
  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,

  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.assignment": supported,
  "name.assignment.pattern": supported,
  "name.class": supported,
  "name.enum": supported,
  "name.field.class": supported,
  "name.field.enum": supported,
  "name.foreach": supported,
  "name.function": supported,
  "name.method": supported,
  "name.namespace": supported,
  "name.variable": supported,
  "name.variable.pattern": supported,
  "name.iteration.block": supported,
  "name.iteration.class": supported,
  "name.iteration.enum": supported,
  "name.iteration.document": supported,

  "value.assignment": supported,
  "value.foreach": supported,
  "value.return": supported,
  "value.return.lambda": supported,
  "value.switch": supported,
  "value.typeAlias": supported,
  "value.variable": supported,
  "value.iteration.block": supported,
  "value.iteration.class": supported,
  "value.iteration.document": supported,

  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.argument.formal.method": supported,
  "type.argument.formal.method.iteration": supported,
  "type.class": supported,
  "type.enum": supported,
  "type.field.class": supported,
  "type.return": supported,
  "type.variable": supported,
  "type.typeArgument": supported,
  "type.typeArgument.iteration": supported,
  "type.alias": supported,
  "type.cast": supported,
  "type.iteration.block": supported,
  "type.iteration.class": supported,
  "type.iteration.document": supported,

  "interior.class": supported,
  "interior.enum": supported,
  "interior.function": supported,
  "interior.method": supported,
  "interior.lambda": supported,
  "interior.if": supported,
  "interior.switch": supported,
  "interior.switchCase": supported,
  "interior.foreach": supported,
  "interior.while": supported,
  "interior.namespace": supported,

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
  "interior.interface": notApplicable,

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

  // Map literal
  map: notApplicable,
  "key.mapPair": notApplicable,
  "key.mapPair.iteration": notApplicable,
  "value.mapPair": notApplicable,
  "value.mapPair.iteration": notApplicable,

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

  // For loop
  "statement.for": notApplicable,
  "condition.for": notApplicable,
  "interior.for": notApplicable,

  // Do-while loop
  "statement.doWhile": notApplicable,
  "condition.doWhile": notApplicable,
  "interior.doWhile": notApplicable,

  // Try / catch
  "statement.try": notApplicable,
  "branch.try": notApplicable,
  "branch.try.iteration": notApplicable,
  "interior.try": notApplicable,
  "argument.catch": notApplicable,
  "name.argument.catch": notApplicable,
  "type.argument.catch": notApplicable,

  // Branches and conditions
  "branch.ternary": notApplicable,
  "branch.ternary.iteration": notApplicable,
  "branch.loop": notApplicable,
  "branch.loop.iteration": notApplicable,
  "condition.ternary": notApplicable,

  // Collection items without delimiters
  "collectionItem.unenclosed.singleLine": notApplicable,
  "collectionItem.unenclosed.multiLine": notApplicable,
  "collectionItem.unenclosed.iteration": notApplicable,

  // Yield
  "statement.yield": notApplicable,
  "value.yield": notApplicable,

  // Notebook cell
  notebookCell: notApplicable,
  "interior.cell": notApplicable,

  // Enum field values
  "value.field.enum": notApplicable,
  "value.iteration.enum": notApplicable,

  // Static
  "statement.static": notApplicable,
  "interior.static": notApplicable,

  // Miscellaneous
  "statement.misc": notApplicable,
  "value.field.class": notApplicable,
  "type.foreach": notApplicable,
  "class.iteration.block": notApplicable,
  "value.variable.pattern": notApplicable,
  environment: notApplicable,
  regularExpression: notApplicable,
  selector: notApplicable,
  unit: notApplicable,
  pairDelimiter: notApplicable,
};
