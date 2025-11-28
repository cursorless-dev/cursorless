import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable, unsupported } = ScopeSupportFacetLevel;

export const zigScopeSupport: LanguageScopeSupportFacetMap = {
  namedFunction: supported,
  functionCall: supported,
  functionCallee: supported,
  "argument.formal.singleLine": supported,
  "argument.actual.singleLine": supported,
  "argumentList.formal.singleLine": supported,
  "argumentList.actual.singleLine": supported,
  "statement.assignment": supported,

  /* UNSUPPORTED  */

  list: unsupported,

  "statement.function": unsupported,
  "statement.if": unsupported,
  "statement.try": unsupported,
  "statement.for": unsupported,
  "statement.foreach": unsupported,
  "statement.return": unsupported,
  "statement.break": unsupported,
  "statement.continue": unsupported,

  "argumentList.formal.empty": unsupported,
  "argumentList.formal.multiLine": unsupported,
  "argumentList.actual.empty": unsupported,
  "argumentList.actual.multiLine": unsupported,
  "argument.actual.multiLine": unsupported,

  "comment.line": unsupported,
  "comment.block": unsupported,

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

  "name.assignment": unsupported,
  "name.function": unsupported,
  "name.argument.catch": unsupported,
  "name.foreach": unsupported,

  "value.argument.formal": unsupported,
  "value.argument.formal.iteration": unsupported,
  "value.assignment": unsupported,
  "value.variable": unsupported,
  "value.foreach": unsupported,
  "value.return": unsupported,
  "value.switch": unsupported,
  "value.iteration.block": unsupported,

  "interior.class": unsupported,
  "interior.function": unsupported,
  // "interior.constructor": unsupported,
  // "interior.method": unsupported,
  "interior.if": unsupported,
  // "interior.lambda": unsupported,
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
