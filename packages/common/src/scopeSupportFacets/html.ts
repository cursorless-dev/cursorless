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
  ["value.assignment"]: notApplicable,
};
