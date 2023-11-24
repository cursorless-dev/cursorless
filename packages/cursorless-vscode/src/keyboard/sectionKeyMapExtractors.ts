import { isTesting } from "@cursorless/common";
import { mapValues, merge, pickBy } from "lodash";
import * as vscode from "vscode";
import { KeyMap, SectionName, TokenType } from "./TokenTypeHelpers";
import { SectionTypes, TokenTypeValueMap } from "./TokenTypes";
import { defaultMap } from "./defaultKeymaps";

/**
 * Returns a keymap for a given config section that is intended to be further
 * processed by eg {@link getSectionEntries} or {@link getSingularSectionEntry}.
 * @param sectionName The name of the config section
 * @returns A keymap for a given config section
 */
function getSectionKeyMapRaw<S extends SectionName>(
  sectionName: S,
): KeyMap<SectionTypes[S]> {
  type T = SectionTypes[S];
  const userOverrides: KeyMap<T> = isTesting()
    ? {}
    : vscode.workspace
        .getConfiguration("cursorless.experimental.keyboard.modal.keybindings")
        .get<KeyMap<T>>(sectionName) ?? {};
  const defaultKeyMap: KeyMap<T> = defaultMap[sectionName] ?? {};
  return merge({}, defaultKeyMap, userOverrides);
}

/**
 * Returns a keymap with a subset of entries from a given config section. If
 * `values` is not provided, all entries will be returned.
 *
 * Example:
 *
 * ```ts
 * assert.equal(
 *   getSingularSectionEntry(getSectionKeyMapRaw("misc"), "direction", ["forward", "backward"]),
 *   {
 *     "f": { type: "direction", value: "forward" },
 *     "b": { type: "direction", value: "backward" },
 *   },
 * );
 * ```
 *
 * @param keyMap The keymap for the given config section
 * @param value The value to get the entries for
 * @returns A keymap with entries only for the given value
 */
export function getSectionKeyMap<
  K extends keyof SectionTypes,
  T extends TokenType,
  V extends SectionTypes[K] & TokenTypeValueMap[T] = SectionTypes[K] &
    TokenTypeValueMap[T],
>(sectionName: K, type: T, values?: V[]): KeyMap<{ type: T; value: V }> {
  return mapValues(
    pickBy(
      getSectionKeyMapRaw(sectionName),
      (v): v is V => values?.includes(v as V) ?? true,
    ),
    (value) => ({
      type,
      value,
    }),
  );
}

/**
 * Returns a keymap with entries only for the given value. This map will usually
 * just contain a single entry, but it's possible for a user to have aliases for
 * a given value, in which case it will contain multiple entries.
 *
 * Example:
 *
 * ```ts
 * assert.equal(
 *   getSingularSectionEntry(getSectionKeyMapRaw("misc"), "makeRange"),
 *   {
 *     "r": { type: "makeRange" },
 *   },
 * );
 * ```
 *
 * @param keyMap The keymap for the given config section
 * @param value The value to get the entries for
 * @returns A keymap with entries only for the given value
 */
export function getSingularSectionEntry<
  K extends SectionName,
  V extends SectionTypes[K] & TokenType,
>(sectionName: K, value: V): KeyMap<{ type: V }> {
  return mapValues(
    pickBy(getSectionKeyMapRaw(sectionName), (v): v is V => v === value),
    (v) => ({
      type: v,
    }),
  );
}
