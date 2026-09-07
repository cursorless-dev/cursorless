import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const swiftScopeSupport: LanguageScopeSupportFacetMap = {
  /* SUPPORTED OR UNSUPPORTED (PLANNED) */

  // if/else/elif
  ifStatement: supported,
  "branch.if": supported,
  "branch.if.else": supported,
  "branch.if.elif.else": supported,
  "condition.if": supported,
  "interior.if": supported,
  "branch.if.iteration": supported,

  // ternary operator
  "branch.ternary": unsupported,
  "condition.ternary": unsupported,
  "branch.ternary.iteration": unsupported,

  // for loop
  "statement.foreach": supported,
  "name.foreach": supported,
  "value.foreach": supported,
  "type.foreach": supported,
  "interior.foreach": supported,

  // while loop
  "statement.while": unsupported,
  "condition.while": unsupported,
  "interior.while": unsupported,

  // repeat-while loop (equivalent to do-while loops in other languages)
  "statement.doWhile": unsupported,
  "condition.doWhile": unsupported,
  "interior.doWhile": unsupported,

  // do-catch (equivalent to try-catch in other languages)
  // we're probably going to want a new scope facet for swift's try statements (`statement.tryErrorable`?)
  "statement.try": unsupported,
  "branch.try": unsupported,
  "interior.try": unsupported,
  "branch.try.iteration": unsupported,

  // switch
  "statement.switch": unsupported,
  "branch.switchCase": unsupported,
  "condition.switchCase": unsupported,
  "value.switch": unsupported,
  "interior.switch": unsupported,
  "interior.switchCase": unsupported,

  "branch.switchCase.iteration": unsupported,
  "condition.switchCase.iteration": unsupported,

  // misc control transfer (returns, throw/break/continue statements, etc)
  "statement.return": unsupported,
  "value.return": unsupported,
  "value.return.lambda": unsupported,
  "statement.throw": unsupported,
  "value.throw": unsupported,
  "statement.break": unsupported,
  "statement.continue": unsupported,
  "type.return": unsupported,
  "type.return.method": unsupported,
  "type.return.lambda": unsupported,

  // enum
  "statement.enum": supported,
  "name.enum": supported,
  "type.enum": supported,
  "interior.enum": supported,

  "name.iteration.enum": supported,
  "value.iteration.enum": supported,

  // class
  class: supported,
  "statement.class": supported,
  "name.class": supported,
  "interior.class": supported,
  "type.class": unsupported,

  "statement.iteration.class": supported,
  "class.iteration.class": supported,
  "namedFunction.iteration.class": supported,
  "name.iteration.class": supported,
  "value.iteration.class": unsupported,
  "type.iteration.class": supported,

  // protocol (equivalent to interfaces in other languages)
  "statement.interface": supported,
  "name.interface": supported,
  "interior.interface": supported,
  "type.interface": unsupported,

  "statement.iteration.interface": supported,
  "name.iteration.interface": supported,
  "type.iteration.interface": supported,

  // "standard" functions & methods
  namedFunction: unsupported,
  "namedFunction.method": unsupported,
  "statement.function": unsupported,
  "statement.method": unsupported,
  "name.function": unsupported,
  "name.method": unsupported,
  "interior.function": unsupported,
  "interior.method": unsupported,

  // constructors
  "namedFunction.constructor": unsupported,
  "statement.constructor": unsupported,
  "name.constructor": unsupported,
  "interior.constructor": unsupported,

  // protocol method declarations
  "statement.method.interface": unsupported,
  "name.method.interface": unsupported,

  // closures/lambda functions
  anonymousFunction: unsupported,
  "interior.lambda": unsupported,

  // function calls
  functionCall: unsupported,
  "functionCall.constructor": unsupported,
  "functionCall.method": unsupported,
  "functionCall.chain": unsupported,
  "functionCall.generic": unsupported,
  "functionCall.enum": unsupported,

  // function callee
  functionCallee: unsupported,
  "functionCallee.constructor": unsupported,
  "functionCallee.method": unsupported,
  "functionCallee.chain": unsupported,
  "functionCallee.generic": unsupported,
  "functionCallee.enum": unsupported,

  // argument (actual; as in parameters as passed to a call)
  "argument.actual.singleLine": unsupported,
  "argument.actual.multiLine": unsupported,
  "argument.actual.method.singleLine": unsupported,
  "argument.actual.method.multiLine": unsupported,
  "argument.actual.constructor.singleLine": unsupported,
  "argument.actual.constructor.multiLine": unsupported,
  "argument.actual.enum.singleLine": unsupported,
  "argument.actual.enum.multiLine": unsupported,

  "argument.actual.iteration": unsupported,
  "argument.actual.method.iteration": unsupported,
  "argument.actual.constructor.iteration": unsupported,
  "argument.actual.enum.iteration": unsupported,

  // argument (formal; as in the argument members within a callable block and its declaration)
  "argument.formal.singleLine": unsupported,
  "argument.formal.multiLine": unsupported,
  "argument.formal.method.singleLine": unsupported,
  "argument.formal.method.multiLine": unsupported,
  "argument.formal.constructor.singleLine": unsupported,
  "argument.formal.constructor.multiLine": unsupported,
  "argument.formal.lambda.singleLine": unsupported,
  "argument.formal.lambda.multiLine": unsupported,
  "argument.formal.catch": unsupported,

  "argument.formal.iteration": unsupported,
  "argument.formal.method.iteration": unsupported,
  "argument.formal.constructor.iteration": unsupported,
  "argument.formal.lambda.iteration": unsupported,

  // argument list (actual)
  "argumentList.actual.empty": unsupported,
  "argumentList.actual.singleLine": unsupported,
  "argumentList.actual.multiLine": unsupported,
  "argumentList.actual.method.empty": unsupported,
  "argumentList.actual.method.singleLine": unsupported,
  "argumentList.actual.method.multiLine": unsupported,
  "argumentList.actual.constructor.empty": unsupported,
  "argumentList.actual.constructor.singleLine": unsupported,
  "argumentList.actual.constructor.multiLine": unsupported,
  "argumentList.actual.enum.empty": unsupported,
  "argumentList.actual.enum.singleLine": unsupported,
  "argumentList.actual.enum.multiLine": unsupported,

  // argument list (formal)
  "argumentList.formal.empty": unsupported,
  "argumentList.formal.singleLine": unsupported,
  "argumentList.formal.multiLine": unsupported,
  "argumentList.formal.lambda.empty": unsupported,
  "argumentList.formal.lambda.singleLine": unsupported,
  "argumentList.formal.lambda.multiLine": unsupported,
  "argumentList.formal.method.empty": unsupported,
  "argumentList.formal.method.singleLine": unsupported,
  "argumentList.formal.method.multiLine": unsupported,
  "argumentList.formal.constructor.empty": unsupported,
  "argumentList.formal.constructor.singleLine": unsupported,
  "argumentList.formal.constructor.multiLine": unsupported,

  // variables and constants (var, let)
  fieldAccess: unsupported,

  "statement.field.class": unsupported,
  "statement.field.interface": unsupported,
  "statement.variable.uninitialized": unsupported,
  "statement.variable.initialized": unsupported,
  "statement.variable.destructuring": unsupported,
  "statement.constant": unsupported,

  "name.field.class": unsupported,
  "name.field.interface": unsupported,
  "name.field.enum": unsupported,
  "name.variable.uninitialized": unsupported,
  "name.variable.initialized": unsupported,
  "name.variable.destructuring": unsupported,
  "name.constant": unsupported,

  "value.constant": unsupported,
  "value.field.class": unsupported,
  "value.field.interface": unsupported,
  "value.field.enum": unsupported,
  "value.variable": unsupported,
  "value.variable.destructuring": unsupported,

  "type.constant": supported,
  "type.variable.uninitialized": supported,
  "type.variable.initialized": supported,
  "type.field.class": supported,
  "type.field.interface": supported,

  // assignments
  "statement.assignment": unsupported,
  "statement.assignment.destructuring": unsupported,
  "statement.assignment.compound": unsupported,
  "name.assignment": unsupported,
  "name.assignment.destructuring": unsupported,
  "name.assignment.compound": unsupported,

  "value.assignment": unsupported,
  "value.assignment.destructuring": unsupported,
  "value.assignment.compound": unsupported,

  // comments
  "comment.line": supported,
  "textFragment.comment.line": supported,
  "textFragment.comment.block": supported,
  "comment.block": supported,

  // strings
  "string.singleLine": supported,
  "string.multiLine": supported,
  "textFragment.string.multiLine": supported,
  "textFragment.string.singleLine": supported,

  // document-wide iteration
  "statement.iteration.document": unsupported,
  "class.iteration.document": unsupported,
  "namedFunction.iteration.document": unsupported,
  "name.iteration.document": unsupported,
  "value.iteration.document": unsupported,
  "type.iteration.document": supported,

  // general per-block iteration (not branches)
  "statement.iteration.block": unsupported,
  "name.iteration.block": unsupported,
  "value.iteration.block": unsupported,
  "type.iteration.block": supported,

  // unenclosed collection item
  "collectionItem.unenclosed.singleLine": unsupported,
  "collectionItem.unenclosed.multiLine": unsupported,
  "collectionItem.unenclosed.iteration": unsupported,

  // enclosed collections
  map: unsupported,
  list: unsupported,
  "key.mapPair": unsupported,
  "key.mapPair.iteration": unsupported,
  "value.mapPair": unsupported,
  "value.mapPair.iteration": unsupported,

  // argument names
  "name.argument.actual": unsupported,
  "name.argument.formal": unsupported,
  "name.argument.formal.method": unsupported,
  "name.argument.formal.lambda": unsupported,
  "name.argument.formal.constructor": unsupported,
  "name.argument.catch": unsupported,

  "name.argument.actual.iteration": unsupported,
  "name.argument.formal.iteration": unsupported,
  "name.argument.formal.method.iteration": unsupported,
  "name.argument.formal.lambda.iteration": unsupported,
  "name.argument.formal.constructor.iteration": unsupported,

  // argument values
  "value.argument.actual": unsupported,
  "value.argument.formal": unsupported,
  "value.argument.formal.method": unsupported,
  "value.argument.formal.constructor": unsupported,
  "value.argument.formal.lambda": unsupported,

  "value.argument.actual.iteration": unsupported,
  "value.argument.formal.iteration": unsupported,
  "value.argument.formal.method.iteration": unsupported,
  "value.argument.formal.constructor.iteration": unsupported,
  "value.argument.formal.lambda.iteration": unsupported,

  // argument types
  "type.argument.formal": unsupported,
  "type.argument.formal.method": unsupported,
  "type.argument.formal.lambda": unsupported,
  "type.argument.formal.constructor": unsupported,
  "type.argument.catch": unsupported,

  "type.argument.formal.iteration": unsupported,
  "type.argument.formal.method.iteration": unsupported,
  "type.argument.formal.lambda.iteration": unsupported,
  "type.argument.formal.constructor.iteration": unsupported,

  // type aliases
  "name.typeAlias": unsupported,
  "value.typeAlias": unsupported,
  "statement.typeAlias": unsupported,
  "statement.misc": unsupported,
  "type.typeArgument": unsupported,
  "type.alias": unsupported,
  "type.cast": unsupported,
  "type.typeArgument.iteration": unsupported,

  // misc
  regularExpression: unsupported,
  disqualifyDelimiter: unsupported,
  pairDelimiter: unsupported,

  /* NOT APPLICABLE */

  // c-style for loop
  "statement.for": notApplicable,
  "condition.for": notApplicable,
  "interior.for": notApplicable,

  // loop branches
  "branch.loop": notApplicable,
  "branch.loop.iteration": notApplicable,

  // XML/CSS/LaTeX/Markdown specific
  section: notApplicable,
  "section.iteration.document": notApplicable,
  "section.iteration.parent": notApplicable,
  element: notApplicable,
  tags: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  "interior.element": notApplicable,
  "textFragment.element": notApplicable,
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,
  environment: notApplicable,
  notebookCell: notApplicable,
  selector: notApplicable,
  unit: notApplicable,
  "interior.cell": notApplicable,

  // Command
  command: notApplicable,
  "statement.command": notApplicable,
  "name.command": notApplicable,
  "value.command": notApplicable,
  "interior.command": notApplicable,

  // Resource
  "statement.resource": notApplicable,
  "name.resource": notApplicable,
  "value.resource": notApplicable,
  "type.resource": notApplicable,
  "interior.resource": notApplicable,

  // Explicit namespace declarations
  "statement.namespace": notApplicable,
  "name.namespace": notApplicable,
  "interior.namespace": notApplicable,

  // Misc
  "statement.update": notApplicable,
  "statement.package": notApplicable,
  "statement.yield": notApplicable,
  "value.yield": notApplicable,
  "interior.static": notApplicable,
  "statement.static": notApplicable,
};
