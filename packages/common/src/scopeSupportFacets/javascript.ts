import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const javascriptScopeSupport: LanguageScopeSupportFacetMap = {
  namedFunction: supported,
  ["name.assignment"]: supported,
  ["key.mapPair"]: supported,
  ["key.mapPair.iteration"]: supported,
  ["value.mapPair"]: supported,
  ["value.mapPair.iteration"]: supported,
  ["value.assignment"]: supported,

  ["key.attribute"]: notApplicable,
  ["tags"]: notApplicable,
};
