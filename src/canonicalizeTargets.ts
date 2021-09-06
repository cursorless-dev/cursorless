import {
  PartialPrimitiveTarget,
  PartialTarget,
  ScopeType,
} from "./typings/Types";
import update from "immutability-helper";
import { transformPrimitiveTargets } from "./util/targetUtils";
import { HatStyleName } from "./core/constants";
import { flow } from "lodash";

const scopeTypeAliasToCanonicalName: Record<string, ScopeType> = {
  arrowFunction: "anonymousFunction",
  dictionary: "map",
  regex: "regularExpression",
};

const colorAliasToCanonicalName: Record<string, HatStyleName> = {
  purple: "pink",
};

const canonicalizeScopeTypes = (
  target: PartialPrimitiveTarget
): PartialPrimitiveTarget =>
  target.modifier?.type === "containingScope"
    ? update(target, {
        modifier: {
          scopeType: (scopeType: string) =>
            scopeTypeAliasToCanonicalName[scopeType] ?? scopeType,
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
            colorAliasToCanonicalName[symbolColor] ?? symbolColor,
        },
      })
    : target;

export default function canonicalizeTargets(partialTargets: PartialTarget[]) {
  return transformPrimitiveTargets(
    partialTargets,
    flow(canonicalizeScopeTypes, canonicalizeColors)
  );
}
