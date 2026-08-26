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
  "branch.if.iteration": supported,
  "condition.if": supported,
  "interior.if": supported,

  // ternary operator
  "branch.ternary": unsupported,
  "branch.ternary.iteration": unsupported,
  "condition.ternary": unsupported,

  // for loop
  "statement.foreach": supported,
  "name.foreach": supported,
  "value.foreach": supported,
  "type.foreach": supported,

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
  "branch.try.iteration": unsupported,
  "interior.try": unsupported,

  // switch
  "statement.switch": unsupported,
  "branch.switchCase": unsupported,
  "branch.switchCase.iteration": unsupported,
  "condition.switchCase": unsupported,
  "condition.switchCase.iteration": unsupported,
  "value.switch": unsupported,
  "interior.switch": unsupported,
  "interior.switchCase": unsupported,

  // misc control transfer (returns, throw/break/continue statements, etc)
  "statement.return": unsupported,
  "value.return": unsupported,
  "value.return.lambda": unsupported,
  "statement.throw": unsupported,
  "value.throw": unsupported,
  "statement.break": unsupported,
  "statement.continue": unsupported,

  // enum
  "statement.enum": supported,
  "name.enum": supported,
  "name.iteration.enum": supported,
  "type.enum": supported,
  "interior.enum": supported,
  "value.iteration.enum": supported,

  // class
  class: supported,
  "statement.class": supported,
  "name.class": supported,

  // protocol (equivalent to interfaces in other languages)
  "statement.interface": supported,
  "name.interface": supported,

  // "standard" functions & methods
  namedFunction: unsupported,
  "namedFunction.method": unsupported,
  "statement.function": unsupported,
  "statement.method": unsupported,
  "name.function": unsupported,
  "name.method": unsupported,

  // constructors
  "namedFunction.constructor": unsupported,
  "statement.constructor": unsupported,
  "name.constructor": unsupported,

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

  // argument (actual)
  "argument.actual.singleLine": unsupported,
  "argument.actual.multiLine": unsupported,
  "argument.actual.iteration": unsupported,
  "argument.actual.method.singleLine": unsupported,
  "argument.actual.method.multiLine": unsupported,
  "argument.actual.method.iteration": unsupported,
  "argument.actual.constructor.singleLine": unsupported,
  "argument.actual.constructor.multiLine": unsupported,
  "argument.actual.constructor.iteration": unsupported,
  "argument.actual.enum.singleLine": unsupported,
  "argument.actual.enum.multiLine": unsupported,
  "argument.actual.enum.iteration": unsupported,

  // argument (formal)
  "argument.formal.singleLine": unsupported,
  "argument.formal.multiLine": unsupported,
  "argument.formal.iteration": unsupported,
  "argument.formal.method.singleLine": unsupported,
  "argument.formal.method.multiLine": unsupported,
  "argument.formal.method.iteration": unsupported,
  "argument.formal.constructor.singleLine": unsupported,
  "argument.formal.constructor.multiLine": unsupported,
  "argument.formal.constructor.iteration": unsupported,
  "argument.formal.lambda.singleLine": unsupported,
  "argument.formal.lambda.multiLine": unsupported,
  "argument.formal.lambda.iteration": unsupported,
  "argument.formal.catch": unsupported,

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

  "name.field.class": notApplicable,
  "name.field.interface": notApplicable,
  "name.field.enum": notApplicable,
  "name.variable.uninitialized": unsupported,
  "name.variable.initialized": unsupported,
  "name.variable.destructuring": unsupported,
  "name.constant": unsupported,

  "value.constant": unsupported,
  "value.field.class": unsupported,
  "value.field.interface": unsupported,
  "value.field.enum": unsupported,

  // assignments
  "statement.assignment": unsupported,
  "statement.assignment.destructuring": unsupported,
  "statement.assignment.compound": unsupported,
  "name.assignment": unsupported,
  "name.assignment.destructuring": unsupported,
  "name.assignment.compound": unsupported,

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

  // per-class iteration
  "statement.iteration.class": supported,
  "class.iteration.class": supported,
  "namedFunction.iteration.class": supported,
  "name.iteration.class": supported,
  "value.iteration.class": supported,
  "type.iteration.class": supported,

  // per-protocol iteration
  "statement.iteration.interface": supported,
  "name.iteration.interface": supported,
  "type.iteration.interface": supported,

  // per-block iteration -- todo: do classlikes, functions, protocols, branches, etc. count as blocks?
  "statement.iteration.block": unsupported,
  "name.iteration.block": unsupported,
  "value.iteration.block": unsupported,
  "type.iteration.block": unsupported,

  // unenclosed collection item
  "collectionItem.unenclosed.singleLine": unsupported,
  "collectionItem.unenclosed.multiLine": unsupported,
  "collectionItem.unenclosed.iteration": unsupported,  

  // enclosed collections
  map: unsupported,
  list: unsupported,
  "key.mapPair": unsupported,
  "key.mapPair.iteration": unsupported,
    
  // misc
  regularExpression: unsupported,
  disqualifyDelimiter: unsupported,
  pairDelimiter: unsupported,
  "name.typeAlias": unsupported,
  "statement.typeAlias": unsupported,
  "statement.misc": unsupported,
  // todo: do static variables/constants fulfill the scope facet "statement.static", or is that only for static blocks?
  // "statement.static": unsupported,

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

  // TODO: reorganize these!!!
  "name.argument.actual": notApplicable,
  "name.argument.actual.iteration": notApplicable,
  "name.argument.formal": notApplicable,
  "name.argument.formal.iteration": notApplicable,
  "name.argument.formal.method": notApplicable,
  "name.argument.formal.method.iteration": notApplicable,
  "name.argument.formal.lambda": notApplicable,
  "name.argument.formal.lambda.iteration": notApplicable,
  "name.argument.formal.constructor": notApplicable,
  "name.argument.formal.constructor.iteration": notApplicable,
  "name.argument.catch": notApplicable,

  "value.variable": notApplicable,
  "value.variable.destructuring": notApplicable,
  "value.assignment": notApplicable,
  "value.assignment.destructuring": notApplicable,
  "value.assignment.compound": notApplicable,
  "value.mapPair": notApplicable,
  "value.mapPair.iteration": notApplicable,
  "value.typeAlias": notApplicable,
  "value.argument.actual": notApplicable,
  "value.argument.actual.iteration": notApplicable,
  "value.argument.formal": notApplicable,
  "value.argument.formal.iteration": notApplicable,
  "value.argument.formal.method": notApplicable,
  "value.argument.formal.method.iteration": notApplicable,
  "value.argument.formal.constructor": notApplicable,
  "value.argument.formal.constructor.iteration": notApplicable,
  "value.argument.formal.lambda": notApplicable,
  "value.argument.formal.lambda.iteration": notApplicable,

  "type.variable.uninitialized": notApplicable,
  "type.variable.initialized": notApplicable,
  "type.constant": notApplicable,
  "type.return": notApplicable,
  "type.return.method": notApplicable,
  "type.return.lambda": notApplicable,
  "type.field.class": notApplicable,
  "type.field.interface": notApplicable,
  "type.alias": notApplicable,
  "type.cast": notApplicable,
  "type.class": notApplicable,
  "type.interface": notApplicable,
  "type.typeArgument": notApplicable,
  "type.typeArgument.iteration": notApplicable,
  "type.argument.formal": notApplicable,
  "type.argument.formal.iteration": notApplicable,
  "type.argument.formal.method": notApplicable,
  "type.argument.formal.method.iteration": notApplicable,
  "type.argument.formal.lambda": notApplicable,
  "type.argument.formal.lambda.iteration": notApplicable,
  "type.argument.formal.constructor": notApplicable,
  "type.argument.formal.constructor.iteration": notApplicable,
  "type.argument.catch": notApplicable,

  "interior.class": notApplicable,
  "interior.interface": notApplicable,
  "interior.function": notApplicable,
  "interior.constructor": notApplicable,
  "interior.method": notApplicable,
  "interior.foreach": notApplicable,

};
