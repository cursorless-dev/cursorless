import {
  ScopeSupportFacet,
  ScopeSupportFacetInfo,
} from "./scopeSupportFacets.types";

export const scopeSupportFacetInfos: Record<
  ScopeSupportFacet,
  ScopeSupportFacetInfo
> = {
  namedFunction: {
    label: "Named function",
    description: "A named function",
    scopeType: "namedFunction",
    examples: ["function foo() {}", "const foo = () => {}"],
  },
  ["name.assignment"]: {
    label: "Assignment name",
    description: "Name(LHS) of an assignment",
    scopeType: "name",
    examples: ["const foo = 1"],
  },
  ["key.attribute"]: {
    label: "Attributes key",
    description: "Key(LHS) of an attribute",
    scopeType: "collectionKey",
    examples: ['id="root"'],
  },
  ["key.mapPair"]: {
    label: "Map key",
    description: "Key(LHS) of a map pair",
    scopeType: "collectionKey",
    examples: ["value: 0"],
  },
  ["key.mapPair.iteration"]: {
    label: "Map pair key iteration",
    description: "Iteration of map pair keys",
    scopeType: "collectionKey",
    isIteration: true,
    examples: ["{ value: 0 }"],
  },
  ["value.assignment"]: {
    label: "Assignment value",
    description: "Value(RHS) of an assignment",
    scopeType: "value",
    examples: ["const foo = 1"],
  },
  ["value.mapPair"]: {
    label: "Map pair value",
    description: "Key(RHS) of a map pair",
    scopeType: "value",
    examples: ["value: 0"],
  },
  ["value.mapPair.iteration"]: {
    label: "Map pair value iteration",
    description: "Iteration of map pair values",
    scopeType: "value",
    isIteration: true,
    examples: ["{ value: 0 }"],
  },
  ["tags"]: {
    label: "Tags",
    description: "Both tags in an xml element",
    scopeType: "xmlBothTags",
    examples: ["<div></div>"],
  },
};
