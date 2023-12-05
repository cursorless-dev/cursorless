import {
  ScopeSupportFacetLevel,
  TextualLanguageScopeSupportFacetMap,
} from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const textualScopeSupport: TextualLanguageScopeSupportFacetMap = {
  character: supported,
  word: supported,
  token: supported,
  line: supported,
  paragraph: supported,
  document: supported,
};
