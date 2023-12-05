import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const htmlScopeSupport: LanguageScopeSupportFacetMap = {
  ["key.attribute"]: supported,
  ["tags"]: supported,

  namedFunction: notApplicable,
  ["name.assignment"]: notApplicable,
  ["key.mapPair"]: notApplicable,
  ["key.mapPair.iteration"]: notApplicable,
  ["value.mapPair"]: notApplicable,
  ["value.mapPair.iteration"]: notApplicable,
  ["value.assignment"]: notApplicable,
};
