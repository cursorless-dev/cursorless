import {
  PartialPrimitiveTarget,
  PartialTarget,
  ScopeType,
} from "../typings/Types";
import update from "immutability-helper";
import { transformPartialPrimitiveTargets } from "./getPrimitiveTargets";
import { HatStyleName } from "../core/constants";
import { flow } from "lodash";
import { isDeepStrictEqual } from "util";

const SCOPE_TYPE_CANONICALIZATION_MAPPING: Record<string, ScopeType> = {
  arrowFunction: "anonymousFunction",
  dictionary: "map",
  regex: "regularExpression",
};

const COLOR_CANONICALIZATION_MAPPING: Record<string, HatStyleName> = {
  purple: "pink",
};

const canonicalizeScopeTypes = (
  target: PartialPrimitiveTarget
): PartialPrimitiveTarget =>
  target.modifier?.type === "containingScope"
    ? update(target, {
        modifier: {
          scopeType: (scopeType: string) =>
            SCOPE_TYPE_CANONICALIZATION_MAPPING[scopeType] ?? scopeType,
        },
      })
    : target;

const canonicalizeColors = (
  target: PartialPrimitiveTarget
): PartialPrimitiveTarget =>
  target.mark?.type === "decoratedSymbol"
    ? update(target, {
        mark: {
          symbolColor: (symbolColor: string) =>
            COLOR_CANONICALIZATION_MAPPING[symbolColor] ?? symbolColor,
        },
      })
    : target;

const STRICT_HERE = {
  type: "primitive",
  mark: { type: "cursor" },
  selectionType: "token",
  position: "contents",
  modifier: { type: "identity" },
  insideOutsideType: "inside",
};

const IMPLICIT_TARGET: PartialPrimitiveTarget = {
  type: "primitive",
  isImplicit: true,
};

const upgradeStrictHere = (
  target: PartialPrimitiveTarget
): PartialPrimitiveTarget =>
  isDeepStrictEqual(target, STRICT_HERE) ? IMPLICIT_TARGET : target;

export default function canonicalizeTargets(partialTargets: PartialTarget[]) {
  return transformPartialPrimitiveTargets(
    partialTargets,
    flow(canonicalizeScopeTypes, canonicalizeColors, upgradeStrictHere)
  );
}
