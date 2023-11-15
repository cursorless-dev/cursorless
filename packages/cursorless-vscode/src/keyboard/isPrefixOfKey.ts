import { keys, toPairs } from "lodash";
import { Keymap } from "./defaultKeymaps";
import { KeyHandler } from "./KeyHandler";

export function isPrefixOfKey(keyMap: Keymap<unknown>, text: string): boolean {
  return keys(keyMap).some((key) => key.startsWith(text));
}

/**
 * This function can be used to detect if a proposed map entry conflicts with
 * one in the map.  Used to detect if the user tries to use two map entries,
 * one of which is a prefix of the other.
 * @param text The proposed new map entry
 * @returns The first map entry that conflicts with {@link text}, if one
 * exists
 */
export function getConflictingKeyMapEntry<T>(
  keyMap: Keymap<T>,
  text: string,
): KeyHandler<T, V> | undefined {
  const conflictingPair = toPairs(keyMap).find(
    ([key]) => text.startsWith(key) || key.startsWith(text),
  );

  return conflictingPair == null ? undefined : conflictingPair[1];
}
