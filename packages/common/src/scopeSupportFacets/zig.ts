import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable, unsupported } = ScopeSupportFacetLevel;

export const zigScopeSupport: LanguageScopeSupportFacetMap = {
  namedFunction: supported,
  functionCall: supported,
  functionCallee: supported,
  "argument.formal.singleLine": supported,
  "argument.formal.multiLine": supported,
  "argument.formal.iteration": supported,
  "argument.actual.singleLine": supported,
  "argument.actual.multiLine": supported,
  "argument.actual.iteration": supported,
  "argumentList.formal.singleLine": supported,
  "argumentList.formal.multiLine": supported,
  "argumentList.formal.empty": supported,
  "argumentList.actual.singleLine": supported,
  "argumentList.actual.multiLine": supported,
  "argumentList.actual.empty": supported,
  "statement.assignment": supported,
  "name.assignment": supported,
  "name.function": supported,
  "name.argument.formal": supported,
  "value.assignment": supported,
  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.return": supported,
  "type.variable": supported,

  /* UNSUPPORTED  */

  list: unsupported,

  "statement.function": unsupported,
  "statement.class": unsupported,
  "statement.if": unsupported,
  "statement.try": unsupported,
  "statement.for": unsupported,
  "statement.foreach": unsupported,
  "statement.return": unsupported,
  "statement.break": unsupported,
  "statement.continue": unsupported,
  "statement.doWhile": unsupported,
  "statement.enum": unsupported,
  "statement.field.class": unsupported,
  "statement.method": unsupported,
  "statement.misc": unsupported,
  "statement.switch": unsupported,
  "statement.variable": unsupported,

  "comment.line": unsupported,
  "comment.block": unsupported,

  "string.multiLine": unsupported,
  "string.singleLine": unsupported,

  "branch.if": unsupported,
  "branch.if.elif.else": unsupported,
  "branch.if.else": unsupported,
  "branch.if.iteration": unsupported,
  "branch.try": unsupported,
  "branch.try.iteration": unsupported,
  "branch.switchCase": unsupported,
  "branch.switchCase.iteration": unsupported,

  "condition.if": unsupported,
  "condition.while": unsupported,
  "condition.doWhile": unsupported,
  "condition.for": unsupported,
  "condition.ternary": unsupported,
  "condition.switchCase": unsupported,
  "condition.switchCase.iteration": unsupported,

  "name.argument.catch": unsupported,
  "name.foreach": unsupported,

  "value.argument.formal": unsupported,
  "value.argument.formal.iteration": unsupported,
  "value.variable": unsupported,
  "value.foreach": unsupported,
  "value.return": unsupported,
  "value.switch": unsupported,
  "value.iteration.block": unsupported,

  "interior.class": unsupported,
  "interior.function": unsupported,
  "interior.constructor": unsupported,
  "interior.method": unsupported,
  "interior.if": unsupported,
  "interior.lambda": unsupported,
  "interior.for": unsupported,
  "interior.foreach": unsupported,
  "interior.while": unsupported,
  "interior.doWhile": unsupported,
  "interior.switch": unsupported,
  "interior.switchCase": unsupported,
  "interior.try": unsupported,

  // /* NOT APPLICABLE */

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

  // Notebook cell
  notebookCell: notApplicable,
  "interior.cell": notApplicable,
};
