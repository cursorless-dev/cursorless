import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "@cursorless/common";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const htmlSupport: LanguageScopeSupportFacetMap = {
  ["key.attribute"]: supported,
  ["tags.element"]: supported,

  namedFunction: notApplicable,
  ["name.assignment"]: notApplicable,
  ["key.mapPair"]: notApplicable,
  ["key.mapPair.iteration"]: notApplicable,
  ["value.mapPair"]: notApplicable,
  ["value.mapPair.iteration"]: notApplicable,
  ["value.assignment"]: notApplicable,
};
