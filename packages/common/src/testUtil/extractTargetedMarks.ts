import { splitKey } from "..";
import { ReadOnlyHatMap } from "../types/HatTokenMap";
import { Token } from "../types/Token";

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
