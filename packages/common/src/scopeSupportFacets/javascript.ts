import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "@cursorless/common";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const javascriptSupport: LanguageScopeSupportFacetMap = {
  namedFunction: supported,
  ["name.assignment"]: supported,
  ["key.mapPair"]: supported,
  ["key.mapPair.iteration"]: supported,
  ["value.mapPair"]: supported,
  ["value.mapPair.iteration"]: supported,
  ["value.assignment"]: supported,

  ["key.attribute"]: notApplicable,
  ["tags.element"]: notApplicable,
};
