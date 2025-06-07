import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const cCoreScopeSupport: LanguageScopeSupportFacetMap = {
  list: supported,
  ifStatement: supported,
  statement: supported,
  "statement.class": supported,
  class: supported,
  className: supported,
  namedFunction: supported,

  functionName: supported,
  functionCall: supported,
  functionCallee: supported,
  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.actual.method": supported,
  "argument.actual.method.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,

  "comment.line": supported,
  "comment.block": supported,
  "string.singleLine": supported,
  "textFragment.comment.line": supported,
  "textFragment.comment.block": supported,
  "textFragment.string.singleLine": supported,
  disqualifyDelimiter: supported,

  "name.assignment": supported,
  "name.variable": supported,
  "name.function": supported,
  "name.class": supported,
  "name.field": supported,
  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "value.assignment": supported,
  "value.variable": supported,

  "type.variable": supported,
  "type.argument.formal": supported,
  "type.field": supported,
  "type.enum": supported,
  "type.cast": supported,
  "type.class": supported,
  "type.return": supported,

  // Unsupported

  switchStatementSubject: unsupported,
  fieldAccess: unsupported,

  "argumentList.actual.empty": unsupported,
  "argumentList.actual.singleLine": unsupported,
  "argumentList.actual.multiLine": unsupported,
  "argumentList.formal.empty": unsupported,
  "argumentList.formal.singleLine": unsupported,
  "argumentList.formal.multiLine": unsupported,

  "statement.iteration.document": unsupported,
  "statement.iteration.block": unsupported,

  "class.iteration.document": unsupported,
  "class.iteration.block": unsupported,
  "className.iteration.document": unsupported,
  "className.iteration.block": unsupported,

  "functionName.iteration.document": unsupported,
  "namedFunction.iteration.document": unsupported,

  "interior.class": unsupported,
  "interior.function": unsupported,
  "interior.if": unsupported,
  "interior.try": unsupported,
  "interior.switchCase": unsupported,
  "interior.ternary": unsupported,
  "interior.loop": unsupported,

  "branch.if": unsupported,
  "branch.if.iteration": unsupported,
  "branch.try": unsupported,
  "branch.try.iteration": unsupported,
  "branch.switchCase": unsupported,
  "branch.switchCase.iteration": unsupported,
  "branch.ternary": unsupported,
  "branch.loop": unsupported,

  "condition.if": unsupported,
  "condition.while": unsupported,
  "condition.doWhile": unsupported,
  "condition.for": unsupported,
  "condition.ternary": unsupported,
  "condition.switchCase": unsupported,
  "condition.switchCase.iteration": unsupported,

  "collectionItem.unenclosed": unsupported,
  "collectionItem.unenclosed.iteration": unsupported,

  "name.iteration.block": unsupported,
  "name.iteration.document": unsupported,

  "value.return": unsupported,
  "value.field": unsupported,

  "type.field.iteration": unsupported,
  "type.argument.formal.iteration": unsupported,

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

  // Miscellaneous
  "key.attribute": notApplicable,
  "type.interface": notApplicable,
  "value.attribute": notApplicable,
  "value.yield": notApplicable,
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
  "argumentList.actual.method.empty": notApplicable,
  "argumentList.actual.method.multiLine": notApplicable,
  "argumentList.actual.method.singleLine": notApplicable,
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

  // Nested function
  "functionName.iteration.block": notApplicable,
  "namedFunction.iteration.block": notApplicable,
};
