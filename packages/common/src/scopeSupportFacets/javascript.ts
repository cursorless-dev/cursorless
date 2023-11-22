import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "@cursorless/common";

const { supported } = ScopeSupportFacetLevel;

export const javascriptSupport: LanguageScopeSupportFacetMap = {
  namedFunction: supported,
  ["name.assignment"]: supported,
  ["value.assignment"]: supported,
};
