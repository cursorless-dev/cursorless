import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const cCoreScopeSupport: LanguageScopeSupportFacetMap = {
  list: supported,
  disqualifyDelimiter: supported,
  switchStatementSubject: supported,

  ifStatement: supported,
  statement: supported,
  "statement.class": supported,
  "statement.iteration.document": supported,
  "statement.iteration.block": supported,

  class: supported,
  "class.iteration.document": supported,
  className: supported,
  "className.iteration.document": supported,

  "collectionItem.unenclosed": supported,
  "collectionItem.unenclosed.iteration": supported,

  namedFunction: supported,
  functionName: supported,
  "functionName.iteration.document": supported,
  "namedFunction.iteration.document": supported,

  functionCall: supported,
  functionCallee: supported,

  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.actual.method": supported,
  "argument.actual.method.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,

  "argumentList.actual.empty": supported,
  "argumentList.actual.singleLine": supported,
  "argumentList.actual.multiLine": supported,
  "argumentList.actual.method.empty": supported,
  "argumentList.actual.method.singleLine": supported,
  "argumentList.actual.method.multiLine": supported,
  "argumentList.formal.empty": supported,
  "argumentList.formal.singleLine": supported,
  "argumentList.formal.multiLine": supported,

  "branch.if": supported,
  "branch.if.iteration": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": supported,
  "branch.loop": supported,

  "comment.line": supported,
  "comment.block": supported,
  "string.singleLine": supported,
  "textFragment.comment.line": supported,
  "textFragment.comment.block": supported,
  "textFragment.string.singleLine": supported,

  "condition.if": supported,
  "condition.while": supported,
  "condition.doWhile": supported,
  "condition.for": supported,
  "condition.ternary": supported,
  "condition.switchCase": supported,
  "condition.switchCase.iteration": supported,

  "name.assignment": supported,
  "name.variable": supported,
  "name.function": supported,
  "name.class": supported,
  "name.field": supported,
  "name.iteration.block": supported,
  "name.iteration.document": supported,
  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,

  "value.assignment": supported,
  "value.variable": supported,
  "value.return": supported,

  "type.variable": supported,
  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.field": supported,
  "type.field.iteration": supported,
  "type.enum": supported,
  "type.cast": supported,
  "type.class": supported,
  "type.return": supported,

  // Unsupported

  "interior.class": unsupported,
  "interior.function": unsupported,
  "interior.if": unsupported,
  "interior.switchCase": unsupported,
  "interior.ternary": unsupported,
  "interior.loop": unsupported,

  fieldAccess: unsupported,

  // Not applicable (C and C++)

  // Element and tags
  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  "interior.element": notApplicable,
  "textFragment.element": notApplicable,

  // Resource syntax
  "interior.resource": notApplicable,
  "type.resource": notApplicable,
  "type.resource.iteration": notApplicable,
  "name.resource": notApplicable,
  "name.resource.iteration": notApplicable,
  "value.resource": notApplicable,
  "value.resource.iteration": notApplicable,

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

  // Multiline string
  "string.multiLine": notApplicable,
  "textFragment.string.multiLine": notApplicable,

  // Section
  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,

  // Pattern destructing
  "name.assignment.pattern": notApplicable,
  "name.variable.pattern": notApplicable,
  "value.variable.pattern": notApplicable,

  // Command
  command: notApplicable,
  "interior.command": notApplicable,

  // Type alias
  "type.alias": notApplicable,
  "value.typeAlias": notApplicable,

  // Notebook cell
  notebookCell: notApplicable,
  "interior.cell": notApplicable,

  // Nested class
  "class.iteration.block": notApplicable,
  "className.iteration.block": notApplicable,

  // Nested function
  "functionName.iteration.block": notApplicable,
  "namedFunction.iteration.block": notApplicable,

  // Try catch
  "branch.try": notApplicable,
  "branch.try.iteration": notApplicable,
  "interior.try": notApplicable,

  // Miscellaneous
  "key.attribute": notApplicable,
  "type.interface": notApplicable,
  "value.attribute": notApplicable,
  "value.yield": notApplicable,
  "value.field": notApplicable,
  environment: notApplicable,
  pairDelimiter: notApplicable,
  regularExpression: notApplicable,
};

export const cScopeSupport: LanguageScopeSupportFacetMap = {
  ...cCoreScopeSupport,

  // Not applicable for C, but supported for C++
  // These are defined here because we don't want C++  to import them and
  // accidentally forget to add support for them.

  attribute: notApplicable,

  // Lambda
  "argument.formal.lambda.iteration": notApplicable,
  "argument.formal.lambda": notApplicable,
  "argumentList.formal.lambda.empty": notApplicable,
  "argumentList.formal.lambda.multiLine": notApplicable,
  "argumentList.formal.lambda.singleLine": notApplicable,
  "interior.lambda": notApplicable,
  "value.return.lambda": notApplicable,
  anonymousFunction: notApplicable,

  // Constructor
  "argument.actual.constructor.iteration": notApplicable,
  "argument.actual.constructor": notApplicable,
  "argument.formal.constructor.iteration": notApplicable,
  "argument.formal.constructor": notApplicable,
  "argumentList.actual.constructor.empty": notApplicable,
  "argumentList.actual.constructor.multiLine": notApplicable,
  "argumentList.actual.constructor.singleLine": notApplicable,
  "argumentList.formal.constructor.empty": notApplicable,
  "argumentList.formal.constructor.multiLine": notApplicable,
  "argumentList.formal.constructor.singleLine": notApplicable,
  "functionCall.constructor": notApplicable,
  "functionCallee.constructor": notApplicable,
  "functionName.constructor": notApplicable,
  "name.argument.formal.constructor.iteration": notApplicable,
  "name.argument.formal.constructor": notApplicable,
  "name.constructor": notApplicable,
  "namedFunction.constructor": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "value.argument.formal.constructor.iteration": notApplicable,
  "value.argument.formal.constructor": notApplicable,

  // Method
  "argument.formal.method.iteration": notApplicable,
  "argument.formal.method": notApplicable,
  "argumentList.formal.method.empty": notApplicable,
  "argumentList.formal.method.multiLine": notApplicable,
  "argumentList.formal.method.singleLine": notApplicable,
  "functionName.method.iteration.class": notApplicable,
  "functionName.method": notApplicable,
  "name.argument.formal.method.iteration": notApplicable,
  "name.argument.formal.method": notApplicable,
  "name.method": notApplicable,
  "namedFunction.method.iteration.class": notApplicable,
  "namedFunction.method": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.argument.formal.method": notApplicable,
  "value.argument.formal.method.iteration": notApplicable,
  "value.argument.formal.method": notApplicable,

  // Foreach
  "name.foreach": notApplicable,
  "type.foreach": notApplicable,
  "value.foreach": notApplicable,

  // Default argument value
  "value.argument.formal": notApplicable,
  "value.argument.formal.iteration": notApplicable,

  // Generic type
  "type.typeArgument": notApplicable,
  "type.typeArgument.iteration": notApplicable,
};
