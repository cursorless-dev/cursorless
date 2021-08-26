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

function extractTargetKeys(target: Target): string[] {
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
  targets: Target[],
  navigationMap: NavigationMap
) {
  const targetedMarks: { [coloredSymbol: string]: Token } = {};
  const targetKeys = targets.map(extractTargetKeys).flat();
  targetKeys.forEach((key) => {
    const { color, character } = NavigationMap.splitKey(key);
    targetedMarks[key] = navigationMap.getToken(
      color as HatStyleName,
      character
    );
  });
  return targetedMarks;
}
