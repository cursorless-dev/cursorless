import { mapValues, pickBy } from "lodash";
import { KeyMap, SectionName, TokenType } from "./TokenTypeHelpers";
import { SectionTypes, TokenTypeValueMap } from "./TokenTypes";
import { VscodeApi } from "@cursorless/vscode-common";

const LEGACY_PLURAL_SECTION_NAMES: Record<string, string> = {
  action: "actions",
  color: "colors",
  shape: "shapes",
  vscodeCommand: "vscodeCommands",
  scope: "scopes",
};

export class KeyboardConfig {
  constructor(private vscodeApi: VscodeApi) {}

  /**
   * Returns a keymap for a given config section that is intended to be further
   * processed by eg {@link getSectionEntries} or {@link getSingularSectionEntry}.
   * @param sectionName The name of the config section
   * @returns A keymap for a given config section
   */
  private getSectionKeyMapRaw<S extends SectionName>(
    sectionName: S,
  ): KeyMap<SectionTypes[S]> {
    const getSection = (
      sectionName: string,
    ): KeyMap<SectionTypes[S]> | undefined =>
      this.vscodeApi.workspace
        .getConfiguration("cursorless.experimental.keyboard.modal.keybindings")
        .get<KeyMap<SectionTypes[S]>>(sectionName);

    let section = getSection(sectionName);

    if (section == null || Object.keys(section).length === 0) {
      const legacySectionName = LEGACY_PLURAL_SECTION_NAMES[sectionName];

      if (legacySectionName != null) {
        section = getSection(legacySectionName);
        if (section != null && Object.keys(section).length > 0) {
          this.vscodeApi.window.showWarningMessage(
            `The config section "cursorless.experimental.keyboard.modal.keybindings.${legacySectionName}" is deprecated. Please rename it to "cursorless.experimental.keyboard.modal.keybindings.${sectionName}".`,
          );
        }
      }
    }

    return section ?? {};
  }

  /**
   * Returns a keymap mapping from key sequences to tokens for use in our key
   * sequence parser. If `sectionName` is omitted, it defaults to `type`. If
   * `filter` is provided, it's used to determine whether to include each entry.
   *
   * Example:
   *
   * ```ts
   * assert.equal(
   *   getTokenKeyMap("direction", "misc", (value) => value === "forward" || value === "backward"),
   *   {
   *     "f": { type: "direction", value: "forward" },
   *     "b": { type: "direction", value: "backward" },
   *   },
   * );
   * ```
   *
   * @param tokenType The type of the token
   * @param sectionName The name of the config section
   * @param filter If provided, a function that specifies whether to include each entry
   * @returns A keymap with entries that match the filter condition
   */
  getTokenKeyMap<T extends keyof SectionTypes & TokenType>(
    tokenType: T,
  ): KeyMap<{ type: T; value: SectionTypes[T] }>;
  getTokenKeyMap<K extends keyof SectionTypes, T extends TokenType>(
    tokenType: T,
    sectionName: K,
  ): KeyMap<{ type: T; value: SectionTypes[K] }>;
  getTokenKeyMap<
    T extends TokenType,
    K extends keyof SectionTypes,
    V extends SectionTypes[K] & TokenTypeValueMap[T] = SectionTypes[K] &
      TokenTypeValueMap[T],
  >(
    tokenType: T,
    sectionName: K,
    filter?: (value: V) => boolean,
  ): KeyMap<{ type: T; value: V }>;
  getTokenKeyMap<
    T extends TokenType,
    K extends keyof SectionTypes,
    V extends SectionTypes[K] & TokenTypeValueMap[T] = SectionTypes[K] &
      TokenTypeValueMap[T],
  >(
    tokenType: T,
    sectionName: K = tokenType as unknown as K,
    filter?: (value: V) => boolean,
  ): KeyMap<{ type: T; value: V }> {
    const section = this.getSectionKeyMapRaw(sectionName);

    if (!filter) {
      return mapValues(section, (value) => ({
        type: tokenType,
        value: value as V,
      }));
    }

    return mapValues(
      pickBy(section, (v): v is V => filter(v as V)),
      (value) => ({
        type: tokenType,
        value,
      }),
    );
  }
}

/**
 * Creates a filter function that reports whether a value is one of the provided arguments.
 *
 * @param values Values to include
 * @returns A filter function suitable for use with getTokenKeyMap
 */
export function only<T>(...values: T[]): (value: T) => boolean {
  return (value: T) => values.includes(value);
}

/**
 * Creates a filter function that reports whether a value is not one of the provided arguments.
 *
 * @param values Values to exclude
 * @returns A filter function suitable for use with getTokenKeyMap
 */
export function exclude<T>(...values: T[]): (value: T) => boolean {
  return (value: T) => !values.includes(value);
}
