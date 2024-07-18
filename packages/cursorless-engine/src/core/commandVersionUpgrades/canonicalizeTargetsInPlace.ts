import {
  HatStyleName,
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
  SimpleScopeTypeType,
} from "@cursorless/common";
import { getPartialPrimitiveTargets } from "../../util/getPrimitiveTargets";

const SCOPE_TYPE_CANONICALIZATION_MAPPING: Record<string, SimpleScopeTypeType> =
  {
    arrowFunction: "anonymousFunction",
    dictionary: "map",
    regex: "regularExpression",
  };

const COLOR_CANONICALIZATION_MAPPING: Record<string, HatStyleName> = {
  purple: "pink",
};

function canonicalizeScopeTypesInPlace(
  target: PartialPrimitiveTargetDescriptor,
): void {
  target.modifiers?.forEach((mod) => {
    if (mod.type === "containingScope" || mod.type === "everyScope") {
      mod.scopeType.type =
        SCOPE_TYPE_CANONICALIZATION_MAPPING[mod.scopeType.type] ??
        mod.scopeType.type;
    }
  });
}

function canonicalizeColorsInPlace(
  target: PartialPrimitiveTargetDescriptor,
): void {
  if (target.mark?.type === "decoratedSymbol") {
    target.mark.symbolColor =
      COLOR_CANONICALIZATION_MAPPING[target.mark.symbolColor] ??
      target.mark.symbolColor;
  }
}

export default function canonicalizeTargetsInPlace(
  partialTargets: PartialTargetDescriptor[],
): void {
  getPartialPrimitiveTargets(partialTargets).forEach((target) => {
    canonicalizeScopeTypesInPlace(target);
    canonicalizeColorsInPlace(target);
  });
}
