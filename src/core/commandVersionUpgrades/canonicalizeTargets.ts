import update from "immutability-helper";
import { flow } from "lodash";
import {
  PartialPrimitiveTargetDesc,
  PartialTargetDesc,
  ScopeType,
} from "../../typings/target.types";
import { transformPartialPrimitiveTargets } from "../../util/getPrimitiveTargets";
import { HatStyleName } from "../constants";

const SCOPE_TYPE_CANONICALIZATION_MAPPING: Record<string, ScopeType> = {
  arrowFunction: "anonymousFunction",
  dictionary: "map",
  regex: "regularExpression",
};

const COLOR_CANONICALIZATION_MAPPING: Record<string, HatStyleName> = {
  purple: "pink",
};

const canonicalizeScopeTypes = (
  target: PartialPrimitiveTargetDesc
): PartialPrimitiveTargetDesc => {
  target.modifiers?.forEach((mod) => {
    if (mod.type === "containingScope" || mod.type === "everyScope") {
      mod.scopeType =
        SCOPE_TYPE_CANONICALIZATION_MAPPING[mod.scopeType] ?? mod.scopeType;
    }
  });
  return target;
};

const canonicalizeColors = (
  target: PartialPrimitiveTargetDesc
): PartialPrimitiveTargetDesc =>
  target.mark?.type === "decoratedSymbol"
    ? update(target, {
        mark: {
          symbolColor: (symbolColor: string) =>
            COLOR_CANONICALIZATION_MAPPING[symbolColor] ?? symbolColor,
        },
      })
    : target;

export default function canonicalizeTargets(
  partialTargets: PartialTargetDesc[]
) {
  return transformPartialPrimitiveTargets(
    partialTargets,
    flow(canonicalizeScopeTypes, canonicalizeColors)
  );
}
