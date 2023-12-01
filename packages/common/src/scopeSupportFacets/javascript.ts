import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "@cursorless/common";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const javascriptSupport: LanguageScopeSupportFacetMap = {
  namedFunction: supported,
  ["name.assignment"]: supported,
  ["key.mapPair"]: notApplicable,
  ["key.mapPair.iteration"]: notApplicable,
  ["value.mapPair"]: notApplicable,
  ["value.mapPair.iteration"]: notApplicable,
  ["value.assignment"]: supported,

  ["key.attribute"]: notApplicable,
  ["tags.element"]: notApplicable,
};
