import {
  ScopeSupportFacetLevel,
  TextualLanguageScopeSupportFacetMap,
} from "@cursorless/common";

const { supported } = ScopeSupportFacetLevel;

export const plaintextSupport: TextualLanguageScopeSupportFacetMap = {
  character: supported,
  word: supported,
  token: supported,
  line: supported,
  paragraph: supported,
  document: supported,
};
