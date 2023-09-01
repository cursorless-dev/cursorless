import { splitKey } from "..";
import type { ReadOnlyHatMap } from "../types/HatTokenMap";
import type { Token } from "../types/Token";

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
