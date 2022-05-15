import update from "immutability-helper";
import { flow } from "lodash";
import {
  PartialPrimitiveTarget,
  PartialTarget,
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
  target: PartialPrimitiveTarget
): PartialPrimitiveTarget => {
  target.modifiers?.forEach((mod) => {
    if (mod.type === "containingScope" || mod.type === "everyScope") {
      mod.scopeType =
        SCOPE_TYPE_CANONICALIZATION_MAPPING[mod.scopeType] ?? mod.scopeType;
    }
  });
  return target;
};

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

export default function canonicalizeTargets(partialTargets: PartialTarget[]) {
  return transformPartialPrimitiveTargets(
    partialTargets,
    flow(canonicalizeScopeTypes, canonicalizeColors)
  );
}
