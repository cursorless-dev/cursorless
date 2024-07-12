import type { HatStyleName } from "../ide/types/hatStyles.types";

export function splitKey(key: string) {
  const [hatStyle, character] = key.split(".");

  return {
    hatStyle: hatStyle,
    // If the character is `.` then it will appear as a zero length string
    // due to the way the split on `.` works
    character: character.length === 0 ? "." : character,
  };
}

export function getKey(hatStyle: HatStyleName, character: string) {
  return `${hatStyle}.${character}`;
}
