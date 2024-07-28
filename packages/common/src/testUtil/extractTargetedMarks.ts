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
    const token = hatTokenMap.getToken(hatStyle, character);
    if (token == null) {
      throw new Error(`Couldn't find mark ${hatStyle} '${character}'`);
    }
    targetedMarks[key] = token;
  });

  return targetedMarks;
}
