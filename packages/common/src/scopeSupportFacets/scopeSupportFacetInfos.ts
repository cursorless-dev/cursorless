/* eslint-disable @typescript-eslint/naming-convention */

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
  element: {
    description: "A xml/html element",
    scopeType: "xmlElement",
  },

  attribute: {
    description: "A attribute of an element",
    scopeType: "attribute",
  },

  "name.assignment": {
    description: "Name(LHS) of an assignment",
    scopeType: "name",
  },
  "name.foreach": {
    description: "Variable name in a for each loop",
    scopeType: "name",
  },

  "key.attribute": {
    description: "Key(LHS) of an attribute",
    scopeType: "collectionKey",
  },
  "key.mapPair": {
    description: "Key(LHS) of a map pair",
    scopeType: "collectionKey",
  },
  "key.mapPair.iteration": {
    description: "Iteration of map pair keys",
    scopeType: "collectionKey",
    isIteration: true,
  },

  "value.assignment": {
    description: "Value(RHS) of an assignment",
    scopeType: "value",
  },
  "value.mapPair": {
    description: "Key(RHS) of a map pair",
    scopeType: "value",
  },
  "value.mapPair.iteration": {
    description: "Iteration of map pair values",
    scopeType: "value",
    isIteration: true,
  },
  "value.foreach": {
    description: "Iterable in a for each loop",
    scopeType: "value",
  },
  "value.attribute": {
    description: "Value(RHS) of an attribute",
    scopeType: "value",
  },

  "type.foreach": {
    description: "Type of variable in a for each loop",
    scopeType: "type",
  },

  tags: {
    description: "Both tags in an xml element",
    scopeType: "xmlBothTags",
  },
};
