import type { ReadOnlyHatMap } from "../types/HatTokenMap";
import type { Token } from "../types/Token";
import { splitKey } from "../util/splitKey";

export function extractTargetedMarks(
  targetKeys: string[],
  hatTokenMap: ReadOnlyHatMap,
) {
  const targetedMarks: { [decoratedCharacter: string]: Token } = {};

  for (const key of targetKeys) {
    const { hatStyle, character } = splitKey(key);
    const token = hatTokenMap.getToken(hatStyle, character);
    if (token == null) {
      throw new Error(`Couldn't find mark ${hatStyle} '${character}'`);
    }
    targetedMarks[key] = token;
  }

  return targetedMarks;
}
