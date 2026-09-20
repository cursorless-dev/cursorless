import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const swiftScopeSupport: LanguageScopeSupportFacetMap = {
  // if/else/elif
  ifStatement: supported,
  "statement.if": supported,
  "branch.if": supported,
  "branch.if.else": supported,
  "branch.if.elif.else": supported,
  "condition.if": supported,
  "interior.if": supported,
  "branch.if.iteration": supported,

  // ternary operator
  "branch.ternary": supported,
  "condition.ternary": supported,
  "branch.ternary.iteration": supported,

  // for loop
  "statement.foreach": supported,
  "name.foreach": supported,
  "value.foreach": supported,
  "type.foreach": supported,
  "interior.foreach": supported,

  // while loop
  "statement.while": supported,
  "condition.while": supported,
  "interior.while": supported,

  // repeat-while loop (equivalent to do-while loops in other languages)
  "statement.doWhile": supported,
  "condition.doWhile": supported,
  "interior.doWhile": supported,

  // do-catch (equivalent to try-catch in other languages)
  // we're probably going to want a new scope facet for swift's try statements (`statement.tryErrorable`?)
  "statement.try": supported,
  "branch.try": supported,
  "interior.try": supported,
  "branch.try.iteration": supported,

  // switch
  "statement.switch": supported,
  "branch.switchCase": supported,
  "condition.switchCase": supported,
  "value.switch": supported,
  "interior.switch": supported,
  "interior.switchCase": supported,

  "branch.switchCase.iteration": supported,
  "condition.switchCase.iteration": supported,

  // misc control transfer (returns, throw/break/continue statements, etc)
  "statement.return": supported,
  "value.return": supported,
  "value.return.lambda": supported,
  "statement.throw": supported,
  "value.throw": supported,
  "statement.break": supported,
  "statement.continue": supported,
  "type.return": supported,
  "type.return.method": supported,
  "type.return.lambda": supported,

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
  "type.class": supported,

  "statement.iteration.class": supported,
  "class.iteration.class": supported,
  "namedFunction.iteration.class": supported,
  "name.iteration.class": supported,
  "value.iteration.class": supported,
  "type.iteration.class": supported,

  // protocol (equivalent to interfaces in other languages)
  "statement.interface": supported,
  "name.interface": supported,
  "interior.interface": supported,
  "type.interface": supported,

  "statement.iteration.interface": supported,
  "name.iteration.interface": supported,
  "type.iteration.interface": supported,

  // "standard" functions & methods
  namedFunction: supported,
  "namedFunction.method": supported,
  "statement.function": supported,
  "statement.method": supported,
  "name.function": supported,
  "name.method": supported,
  "interior.function": supported,
  "interior.method": supported,

  // constructors
  "namedFunction.constructor": supported,
  "statement.constructor": supported,
  "name.constructor": supported,
  "interior.constructor": supported,

  // protocol method declarations
  "statement.method.interface": supported,
  "name.method.interface": supported,

  // closures/lambda functions
  anonymousFunction: supported,
  "interior.lambda": supported,

  // function calls
  functionCall: supported,
  "statement.functionCall": supported,
  "functionCall.constructor": supported,
  "functionCall.method": supported,
  "functionCall.chain": supported,
  "functionCall.generic": supported,
  "functionCall.enum": supported,

  // function callee
  functionCallee: supported,
  "functionCallee.constructor": supported,
  "functionCallee.method": supported,
  "functionCallee.chain": supported,
  "functionCallee.generic": supported,
  "functionCallee.enum": supported,

  // argument (actual; as in parameters as passed to a call)
  "argument.actual.singleLine": supported,
  "argument.actual.multiLine": supported,
  "argument.actual.method.singleLine": supported,
  "argument.actual.method.multiLine": supported,
  "argument.actual.constructor.singleLine": supported,
  "argument.actual.constructor.multiLine": supported,
  "argument.actual.enum.singleLine": supported,
  "argument.actual.enum.multiLine": supported,

  "argument.actual.iteration": supported,
  "argument.actual.method.iteration": supported,
  "argument.actual.constructor.iteration": supported,
  "argument.actual.enum.iteration": supported,

  // argument (formal; as in the argument members within a callable block and its declaration)
  "argument.formal.singleLine": supported,
  "argument.formal.multiLine": supported,
  "argument.formal.method.singleLine": supported,
  "argument.formal.method.multiLine": supported,
  "argument.formal.constructor.singleLine": supported,
  "argument.formal.constructor.multiLine": supported,
  "argument.formal.lambda.singleLine": supported,
  "argument.formal.lambda.multiLine": supported,
  "argument.formal.catch": supported,

  "argument.formal.iteration": supported,
  "argument.formal.method.iteration": supported,
  "argument.formal.constructor.iteration": supported,
  "argument.formal.lambda.iteration": supported,

  // argument list (actual)
  "argumentList.actual.empty": supported,
  "argumentList.actual.singleLine": supported,
  "argumentList.actual.multiLine": supported,
  "argumentList.actual.method.empty": supported,
  "argumentList.actual.method.singleLine": supported,
  "argumentList.actual.method.multiLine": supported,
  "argumentList.actual.constructor.empty": supported,
  "argumentList.actual.constructor.singleLine": supported,
  "argumentList.actual.constructor.multiLine": supported,
  "argumentList.actual.enum.empty": supported,
  "argumentList.actual.enum.singleLine": supported,
  "argumentList.actual.enum.multiLine": supported,

  // argument list (formal)
  "argumentList.formal.empty": supported,
  "argumentList.formal.singleLine": supported,
  "argumentList.formal.multiLine": supported,
  "argumentList.formal.lambda.empty": supported,
  "argumentList.formal.lambda.singleLine": supported,
  "argumentList.formal.lambda.multiLine": supported,
  "argumentList.formal.method.empty": supported,
  "argumentList.formal.method.singleLine": supported,
  "argumentList.formal.method.multiLine": supported,
  "argumentList.formal.constructor.empty": supported,
  "argumentList.formal.constructor.singleLine": supported,
  "argumentList.formal.constructor.multiLine": supported,

  "statement.field.class": supported,
  "statement.field.interface": supported,
  "statement.variable.uninitialized": supported,
  "statement.variable.initialized": supported,
  "statement.variable.destructuring": supported,
  "statement.constant": supported,

  "name.field.class": supported,
  "name.field.interface": supported,
  "name.field.enum": supported,
  "name.variable.uninitialized": supported,
  "name.variable.initialized": supported,
  "name.variable.destructuring": supported,
  "name.constant": supported,

  "value.constant": supported,
  "value.field.class": supported,
  "value.field.interface": supported,
  "value.field.enum": supported,
  "value.variable": supported,
  "value.variable.destructuring": supported,

  "type.constant": supported,
  "type.variable.uninitialized": supported,
  "type.variable.initialized": supported,
  "type.field.class": supported,
  "type.field.interface": supported,

  // assignments
  "statement.assignment": supported,
  "statement.assignment.destructuring": supported,
  "statement.assignment.compound": supported,
  "name.assignment": supported,
  "name.assignment.destructuring": supported,
  "name.assignment.compound": supported,

  "value.assignment": supported,
  "value.assignment.destructuring": supported,
  "value.assignment.compound": supported,

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
  "statement.iteration.document": supported,
  "class.iteration.document": supported,
  "namedFunction.iteration.document": supported,
  "name.iteration.document": supported,
  "value.iteration.document": supported,
  "type.iteration.document": supported,

  // general per-block iteration (not branches)
  "statement.iteration.block": supported,
  "name.iteration.block": supported,
  "value.iteration.block": supported,
  "type.iteration.block": supported,

  // unenclosed collection item
  "collectionItem.unenclosed.singleLine": supported,
  "collectionItem.unenclosed.multiLine": supported,
  "collectionItem.unenclosed.iteration": supported,

  // enclosed collections
  map: supported,
  list: supported,
  "key.mapPair": supported,
  "key.mapPair.iteration": supported,
  "value.mapPair": supported,
  "value.mapPair.iteration": supported,

  // argument names
  "name.argument.actual": supported,
  "name.argument.formal": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.lambda": supported,
  "name.argument.formal.constructor": supported,
  "name.argument.catch": supported,

  "name.argument.actual.iteration": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.method.iteration": supported,
  "name.argument.formal.lambda.iteration": supported,
  "name.argument.formal.constructor.iteration": supported,

  // argument values
  "value.argument.actual": supported,
  "value.argument.formal": supported,
  "value.argument.formal.method": supported,
  "value.argument.formal.constructor": supported,
  "value.argument.formal.lambda": supported,

  "value.argument.actual.iteration": supported,
  "value.argument.formal.iteration": supported,
  "value.argument.formal.method.iteration": supported,
  "value.argument.formal.constructor.iteration": supported,
  "value.argument.formal.lambda.iteration": supported,

  // argument types
  "type.argument.formal": supported,
  "type.argument.formal.method": supported,
  "type.argument.formal.lambda": supported,
  "type.argument.formal.constructor": supported,
  "type.argument.catch": supported,

  "type.argument.formal.iteration": supported,
  "type.argument.formal.method.iteration": supported,
  "type.argument.formal.lambda.iteration": supported,
  "type.argument.formal.constructor.iteration": supported,

  // type aliases
  "name.typeAlias": supported,
  "value.typeAlias": supported,
  "statement.typeAlias": supported,
  "statement.misc": supported,
  "type.typeArgument": supported,
  "type.alias": supported,
  "type.cast": supported,
  "type.typeArgument.iteration": supported,

  // misc
  regularExpression: supported,
  disqualifyDelimiter: supported,
  pairDelimiter: supported,
  "textFragment.regularExpression": supported,
  "statement.import": supported,

  /* UNSUPPORTED */

  fieldAccess: unsupported,

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
  subSection: notApplicable,
  subSubSection: notApplicable,
  sectionLevelOne: notApplicable,
  sectionLevelTwo: notApplicable,
  sectionLevelThree: notApplicable,
  sectionLevelFour: notApplicable,
  sectionLevelFive: notApplicable,
  sectionLevelSix: notApplicable,
  subParagraph: notApplicable,
  namedParagraph: notApplicable,
  chapter: notApplicable,
  part: notApplicable,
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
