import {
  ScopeSupportFacetLevel,
  TextualLanguageScopeSupportFacetMap,
} from "@cursorless/common";

const { supported } = ScopeSupportFacetLevel;

export const plaintextSupport: TextualLanguageScopeSupportFacetMap = {
  line: supported,
  paragraph: supported,
};
