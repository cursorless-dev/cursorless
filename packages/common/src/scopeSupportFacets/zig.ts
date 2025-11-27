import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable, unsupported } = ScopeSupportFacetLevel;

export const zigScopeSupport: LanguageScopeSupportFacetMap = {
  namedFunction: supported,
  list: unsupported,

/* UNSUPPORTED  */

  "textFragment.string.singleLine": unsupported,
  "textFragment.string.multiLine": unsupported,
  "textFragment.comment.line": unsupported,
  "textFragment.comment.block": unsupported,

/* NOT APPLICABLE */

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
