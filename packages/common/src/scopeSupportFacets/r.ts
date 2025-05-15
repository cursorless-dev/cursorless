import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const rScopeSupport: LanguageScopeSupportFacetMap = {
  "comment.line": supported,
  "ifStatement": supported,
  "argument.actual": supported,
  "argumentList.formal": supported,
  "condition.if": supported,
  "condition.while": unsupported,

  "namedFunction": supported,
  "anonymousFunction": supported,
  "functionName": supported,
  "functionCall": supported,
  "functionCallee": supported,

  "name.assignment": supported,
  "name.assignment.pattern": notApplicable,
  "name.variable": supported,
  "value.assignment": supported,
  "value.variable": supported,
  "value.variable.pattern": notApplicable,

  // "interior.function": unsupported,
  // "interior.lambda": unsupported,
  // "interior.if": unsupported,
  // "interior.try": unsupported,

  command: notApplicable,
  element: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  tags: notApplicable,
  attribute: unsupported,
  environment: unsupported,
  // Not applicable for base language but might be useful for markdown or quarto
  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,
  notebookCell: notApplicable,

  map: unsupported,
  regularExpression: unsupported,
  switchStatementSubject: unsupported,
  fieldAccess: unsupported,
  "string.singleLine": unsupported,
  "string.multiLine": unsupported,

  // "statement.class"
  // "statement.iteration.document"
  // "statement.iteration.block"
  class: unsupported,
  // "class.iteration.document"
  // "class.iteration.block"
  className: unsupported,
  // "className.iteration.document"
  // "className.iteration.block"
  // "namedFunction.method"
  // "namedFunction.method.iteration.class"
  // "namedFunction.constructor"
  // "namedFunction.iteration.block"
  // "namedFunction.iteration.document"
  // "functionName.method"
  // "functionName.method.iteration.class"
  // "functionName.constructor"
  // "functionName.iteration.block"
  // "functionName.iteration.document"
  // "functionCall.constructor"
  // "functionCallee.constructor"
  // "argument.actual"
  // "argument.actual.iteration"
  // "argument.actual.method"
  // "argument.actual.method.iteration"
  // "argument.actual.constructor"
  // "argument.actual.constructor.iteration"
  // "argument.formal"
  // "argument.formal.iteration"
  // "argument.formal.method"
  // "argument.formal.method.iteration"
  // "argument.formal.constructor"
  // "argument.formal.constructor.iteration"
  // "argument.formal.lambda"
  // "argument.formal.lambda.iteration"
  // "argumentList.formal.method"
  // "argumentList.formal.constructor"
  // "argumentList.formal.lambda"
  // "textFragment.comment.line"
  // "textFragment.comment.block"
  // "textFragment.string.singleLine"
  // "textFragment.string.multiLine"
  // "textFragment.element"
  // disqualifyDelimiter
  // pairDelimiter
  "branch.if": unsupported,
  // "branch.loop"
  // "branch.if.iteration"
  // "branch.try"
  // "branch.try.iteration"
  // "branch.switchCase"
  // "branch.switchCase.iteration"
  // "branch.ternary"
  // "collectionItem.unenclosed"
  // "collectionItem.unenclosed.iteration"
  // "condition.if"
  // "condition.while"
  // "condition.doWhile"
  // "condition.for"
  // "condition.ternary"
  // "condition.switchCase"
  // "condition.switchCase.iteration"
  // "name.assignment"
  // "name.assignment.pattern"
  // "name.variable"
  // "name.variable.pattern"
  // "name.foreach"
  // "name.function"
  // "name.method"
  // "name.constructor"
  // "name.class"
  // "name.field"
  // "name.resource"
  // "name.resource.iteration"
  // "name.argument.actual"
  // "name.argument.actual.iteration"
  // "name.argument.formal"
  // "name.argument.formal.iteration"
  // "name.argument.formal.method"
  // "name.argument.formal.method.iteration"
  // "name.argument.formal.constructor"
  // "name.argument.formal.constructor.iteration"
  // "name.iteration.block"
  // "name.iteration.document"
  // "key.attribute"
  // "key.mapPair"
  // "key.mapPair.iteration"
  // "value.mapPair"
  // "value.mapPair.iteration"
  // "value.foreach"
  // "value.attribute"
  "value.return": unsupported,
  // "value.return.lambda"
  // "value.field"
  // "value.yield"
  // "value.resource"
  // "value.resource.iteration"
  // "value.argument.formal"
  // "value.argument.formal.iteration"
  // "value.argument.actual"
  // "value.argument.actual.iteration"
  // "value.argument.formal.method"
  // "value.argument.formal.method.iteration"
  // "value.argument.formal.constructor"
  // "value.argument.formal.constructor.iteration"
  // "value.typeAlias": notApplicable,
  "type.variable": notApplicable,
  "type.argument.formal": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "type.return": notApplicable,
  "type.field": notApplicable,
  "type.field.iteration": notApplicable,
  "type.foreach": notApplicable,
  "type.interface": notApplicable,
  "type.enum": notApplicable,
  "type.class": notApplicable,
  "type.alias": notApplicable,
  "type.cast": notApplicable,
  "type.typeArgument": notApplicable,
  "type.typeArgument.iteration": notApplicable,
  "type.resource": notApplicable,
  "type.resource.iteration": notApplicable,
  "interior.element": notApplicable,
  "interior.command": notApplicable,
  "interior.cell": notApplicable,
  "interior.class": unsupported,
  // "interior.switchCase"
  // "interior.ternary"
  // "interior.loop"
  // "interior.resource"

  "name.foreach": unsupported,
};
