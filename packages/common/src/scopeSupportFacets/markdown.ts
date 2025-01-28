import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const markdownScopeSupport: LanguageScopeSupportFacetMap = {
  "comment.line": supported,
  "comment.block": supported,
  section: supported,
  notebookCell: supported,
  "interior.cell": supported,
  "collectionItem.unenclosed": supported,
};
