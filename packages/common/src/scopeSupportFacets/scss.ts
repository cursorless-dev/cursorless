import { cssScopeSupport } from "./css";
import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const scssScopeSupport: LanguageScopeSupportFacetMap = {
  ...cssScopeSupport,

  "namedFunction.iteration": supported,
  "namedFunction.iteration.document": supported,
  "functionName.iteration": supported,
  "functionName.iteration.document": supported,
  "comment.line": supported,
};
