/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

const { supported, supportedLegacy, notApplicable } = ScopeSupportFacetLevel;

export const pythonScopeSupport: LanguageScopeSupportFacetMap = {
  "name.foreach": supported,
  "name.resource": supported,
  "name.resource.iteration": supported,
  "value.foreach": supported,
  "value.yield": supported,
  "value.resource": supported,
  "value.resource.iteration": supported,
  namedFunction: supported,
  anonymousFunction: supported,

  "argument.actual": supportedLegacy,
  "argument.actual.iteration": supportedLegacy,
  "argument.formal": supportedLegacy,
  "argument.formal.iteration": supportedLegacy,

  "collectionItem.import": supported,
  "collectionItem.importFrom": supported,
  "collectionItem.globalVariablesDeclaration": supported,

  "branch.if": supported,
  "branch.if.iteration": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": supported,
  "branch.try": supported,
  "branch.loop": supported,

  element: notApplicable,
  tags: notApplicable,
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,
};
