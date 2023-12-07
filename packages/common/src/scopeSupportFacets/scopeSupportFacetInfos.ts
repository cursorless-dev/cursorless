import {
  ScopeSupportFacet,
  ScopeSupportFacetInfo,
} from "./scopeSupportFacets.types";

export const scopeSupportFacetInfos: Record<
  ScopeSupportFacet,
  ScopeSupportFacetInfo
> = {
  namedFunction: {
    description: "A named function",
    scopeType: "namedFunction",
  },
  ["name.assignment"]: {
    description: "Name(LHS) of an assignment",
    scopeType: "name",
  },
  ["name.foreach"]: {
    description: "Variable name in a for each loop",
    scopeType: "name",
  },
  ["key.attribute"]: {
    description: "Key(LHS) of an attribute",
    scopeType: "collectionKey",
  },
  ["key.mapPair"]: {
    description: "Key(LHS) of a map pair",
    scopeType: "collectionKey",
  },
  ["key.mapPair.iteration"]: {
    description: "Iteration of map pair keys",
    scopeType: "collectionKey",
    isIteration: true,
  },
  ["value.assignment"]: {
    description: "Value(RHS) of an assignment",
    scopeType: "value",
  },
  ["value.mapPair"]: {
    description: "Key(RHS) of a map pair",
    scopeType: "value",
  },
  ["value.mapPair.iteration"]: {
    description: "Iteration of map pair values",
    scopeType: "value",
    isIteration: true,
  },
  ["value.foreach"]: {
    description: "Iterable in a for each loop",
    scopeType: "value",
  },
  ["tags"]: {
    description: "Both tags in an xml element",
    scopeType: "xmlBothTags",
  },
};
