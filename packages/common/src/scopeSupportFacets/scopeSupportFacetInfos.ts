/* eslint-disable @typescript-eslint/naming-convention */

import {
  ScopeSupportFacet,
  ScopeSupportFacetInfo,
} from "./scopeSupportFacets.types";

export const scopeSupportFacetInfos: Record<
  ScopeSupportFacet,
  ScopeSupportFacetInfo
> = {
  element: {
    description: "A xml/html element",
    scopeType: "xmlElement",
  },
  tags: {
    description: "Both tags in an xml element",
    scopeType: "xmlBothTags",
  },
  attribute: {
    description: "A attribute of an element",
    scopeType: "attribute",
  },

  list: {
    description: "A list/array",
    scopeType: "list",
  },
  map: {
    description: "A map/dictionary",
    scopeType: "map",
  },
  ifStatement: {
    description: "An if statement",
    scopeType: "ifStatement",
  },

  class: {
    description: "A class",
    scopeType: "class",
  },
  className: {
    description: "The name of a class",
    scopeType: "className",
  },

  namedFunction: {
    description: "A named function",
    scopeType: "namedFunction",
  },
  "namedFunction.method": {
    description: "A named method in a class",
    scopeType: "namedFunction",
  },
  anonymousFunction: {
    description: "A anonymous function. Lambda or other",
    scopeType: "anonymousFunction",
  },
  "anonymousFunction.lambda": {
    description: "A lambda function",
    scopeType: "anonymousFunction",
  },
  functionName: {
    description: "The name of a function",
    scopeType: "functionName",
  },

  "comment.line": {
    description: "A line comment",
    scopeType: "comment",
  },
  "comment.block": {
    description: "A block comment",
    scopeType: "comment",
  },

  "condition.if": {
    description: "A condition in an if statement",
    scopeType: "condition",
  },
  "condition.while": {
    description: "A condition in a while loop",
    scopeType: "condition",
  },
  "condition.doWhile": {
    description: "A condition in a do while loop",
    scopeType: "condition",
  },
  "condition.for": {
    description: "A condition in a for loop",
    scopeType: "condition",
  },
  "condition.ternary": {
    description: "A condition in a ternary expression",
    scopeType: "condition",
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
  "value.return": {
    description: "Return value of a function",
    scopeType: "value",
  },
  "value.return.lambda": {
    description: "Implicit return value from a lambda",
    scopeType: "value",
  },

  "type.foreach": {
    description: "Type of variable in a for each loop",
    scopeType: "type",
  },
};
