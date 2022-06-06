import update from "immutability-helper";
import { flow } from "lodash";
import {
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
  SimpleScopeTypeType,
} from "../../typings/targetDescriptor.types";
import { transformPartialPrimitiveTargets } from "../../util/getPrimitiveTargets";
import { HatStyleName } from "../constants";

const SCOPE_TYPE_CANONICALIZATION_MAPPING: Record<string, SimpleScopeTypeType> =
  {
    arrowFunction: "anonymousFunction",
    dictionary: "map",
    regex: "regularExpression",
  };

const COLOR_CANONICALIZATION_MAPPING: Record<string, HatStyleName> = {
  purple: "pink",
};

const canonicalizeScopeTypes = (
  target: PartialPrimitiveTargetDescriptor
): PartialPrimitiveTargetDescriptor => {
  target.modifiers?.forEach((mod) => {
    if (mod.type === "containingScope" || mod.type === "everyScope") {
      mod.scopeType.type =
        SCOPE_TYPE_CANONICALIZATION_MAPPING[mod.scopeType.type] ??
        mod.scopeType.type;
    }
  });
  return target;
};

const canonicalizeColors = (
  target: PartialPrimitiveTargetDescriptor
): PartialPrimitiveTargetDescriptor =>
  target.mark?.type === "decoratedSymbol"
    ? update(target, {
        mark: {
          symbolColor: (symbolColor: string) =>
            COLOR_CANONICALIZATION_MAPPING[symbolColor] ?? symbolColor,
        },
      })
    : target;

export default function canonicalizeTargets(
  partialTargets: PartialTargetDescriptor[]
) {
  return transformPartialPrimitiveTargets(
    partialTargets,
    flow(canonicalizeScopeTypes, canonicalizeColors)
  );
}
