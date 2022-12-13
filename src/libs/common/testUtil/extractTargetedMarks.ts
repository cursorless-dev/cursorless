import { getKey, splitKey } from "@cursorless/common";
import type { ReadOnlyHatMap } from "../../../core/IndividualHatMap";
import type {
  PrimitiveTargetDescriptor,
  TargetDescriptor,
} from "../../../typings/targetDescriptor.types";
import type { Token } from "../../../typings/Types";

function extractPrimitiveTargetKeys(...targets: PrimitiveTargetDescriptor[]) {
  const keys: string[] = [];
  targets.forEach((target) => {
    if (target.mark.type === "decoratedSymbol") {
      const { character, symbolColor } = target.mark;
      keys.push(getKey(symbolColor, character));
    }
  });
  return keys;
}

export function extractTargetKeys(target: TargetDescriptor): string[] {
  switch (target.type) {
    case "primitive":
      return extractPrimitiveTargetKeys(target);

    case "list":
      return target.elements.map(extractTargetKeys).flat();

    case "range":
      return extractPrimitiveTargetKeys(target.anchor, target.active);

    default:
      return [];
  }
}

export function extractTargetedMarks(
  targetKeys: string[],
  hatTokenMap: ReadOnlyHatMap,
) {
  const targetedMarks: { [decoratedCharacter: string]: Token } = {};

  targetKeys.forEach((key) => {
    const { hatStyle, character } = splitKey(key);
    targetedMarks[key] = hatTokenMap.getToken(hatStyle, character);
  });

  return targetedMarks;
}
