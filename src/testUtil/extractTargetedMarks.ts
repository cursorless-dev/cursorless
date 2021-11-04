import { HatStyleName } from "../core/constants";
import NavigationMap from "../core/NavigationMap";
import { PrimitiveTarget, Target, Token } from "../typings/Types";

function extractPrimitiveTargetKeys(...targets: PrimitiveTarget[]) {
  const keys: string[] = [];
  targets.forEach((target) => {
    if (target.mark.type === "decoratedSymbol") {
      const { character, symbolColor } = target.mark;
      keys.push(NavigationMap.getKey(symbolColor, character));
    }
  });
  return keys;
}

export function extractTargetKeys(target: Target): string[] {
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
  navigationMap: NavigationMap
) {
  const targetedMarks: { [decoratedCharacter: string]: Token } = {};

  targetKeys.forEach((key) => {
    const { hatStyle, character } = NavigationMap.splitKey(key);
    targetedMarks[key] = navigationMap.getToken(hatStyle, character);
  });

  return targetedMarks;
}
