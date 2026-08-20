import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const swiftScopeSupport: LanguageScopeSupportFacetMap = {
    /* SUPPORTED OR UNSUPPORTED (PLANNED) */

    // if/else/elif
    ifStatement: supported,
    "branch.if": supported,
    "branch.if.else": supported,
    "branch.if.elif.else": unsupported,
    "branch.if.iteration": unsupported,
    "condition.if": supported,
    "interior.if": supported,

    // for loop -- TODO: are swift for loops 'standard' for loops, for-each loops, or both?
    "statement.for": unsupported,
    "statement.foreach": unsupported,
    "condition.for": unsupported,
    "name.foreach": unsupported,
    "value.foreach": unsupported,
    "type.foreach": unsupported,

    // switch
    "statement.switch": unsupported,
    "branch.switchCase": unsupported,
    "branch.switchCase.iteration": unsupported,
    "condition.switchCase": unsupported,
    "value.switch": unsupported,
    "interior.switch": unsupported,
    "interior.switchCase": unsupported,

    // control transfer
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

    // class
    class: supported,
    "statement.class": supported,
    "name.class": supported,

    // protocol (equivalent to interfaces in other languages)
    "statement.interface": supported,
    "name.interface": supported,

    // named function
    namedFunction: supported,

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

    // named variable/member/field
    "statement.field.class": supported,
    "statement.field.interface": supported,
    "statement.variable.uninitialized": supported,
    "statement.variable.initialized": supported,
    "name.variable.initialized": supported,
    "name.variable.uninitialized": supported,

    // variable/member/field value (RHS)
    "value.field.class": unsupported,
    "value.field.interface": unsupported,
    "value.field.enum": unsupported,

    // comments
    "comment.line": supported,
    "string.singleLine": supported,
    "textFragment.comment.line": supported,
    "comment.block": unsupported,

    // document-wide iteration
    "statement.iteration.document": unsupported,
    "class.iteration.document": unsupported,
    "namedFunction.iteration.document": unsupported,
    "name.iteration.document": unsupported,
    "value.iteration.document": unsupported,
    "type.iteration.document": unsupported,

    // per-class iteration
    "statement.iteration.class": unsupported,
    "class.iteration.class": unsupported,
    "namedFunction.iteration.class": unsupported,
    "name.iteration.class": unsupported,
    "value.iteration.class": unsupported,
    "type.iteration.class": unsupported,

    // per-protocol iteration
    "statement.iteration.interface": unsupported,
    "name.iteration.interface": unsupported,
    "type.iteration.interface": unsupported,

    // per-block iteration
    "statement.iteration.block": unsupported,
    "name.iteration.block": unsupported,
    "value.iteration.block": unsupported,
    "type.iteration.block": unsupported,

    // misc
    "statement.assignment.compound": unsupported,
    "statement.typeAlias": unsupported,
    "statement.misc": unsupported,
    

    /* NOT APPLICABLE */

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

};