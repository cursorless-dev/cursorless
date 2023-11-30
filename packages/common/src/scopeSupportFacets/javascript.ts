import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "@cursorless/common";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const javascriptSupport: LanguageScopeSupportFacetMap = {
  namedFunction: supported,
  ["name.assignment"]: supported,
  ["value.assignment"]: supported,
  ["key.attribute"]: notApplicable,
  ["tags.element"]: notApplicable,
};
