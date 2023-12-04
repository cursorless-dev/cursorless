import { mapValues, pickBy } from "lodash";
import { KeyMap, SectionName, TokenType } from "./TokenTypeHelpers";
import { SectionTypes, TokenTypeValueMap } from "./TokenTypes";
import { VscodeApi } from "@cursorless/vscode-common";

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
    return (
      this.vscodeApi.workspace
        .getConfiguration("cursorless.experimental.keyboard.modal.keybindings")
        .get<KeyMap<SectionTypes[S]>>(sectionName) ?? {}
    );
  }

  /**
   * Returns a keymap with a subset of entries from a given config section. If
   * `only` is not provided, all entries will be returned.
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
   * @param sectionName The name of the config section
   * @param type The type of the token
   * @param only If provided, only entries with these values will be returned
   * @returns A keymap with entries only for the given value
   */
  getSectionKeyMap<
    K extends keyof SectionTypes,
    T extends TokenType,
    V extends SectionTypes[K] & TokenTypeValueMap[T] = SectionTypes[K] &
      TokenTypeValueMap[T],
  >(sectionName: K, type: T, only?: V[]): KeyMap<{ type: T; value: V }> {
    const section = this.getSectionKeyMapRaw(sectionName);

    if (only == null) {
      return mapValues(section, (value) => ({
        type,
        value: value as V,
      }));
    }

    return mapValues(
      pickBy(section, (v): v is V => only.includes(v as V)),
      (value) => ({
        type,
        value,
      }),
    );
  }
}
