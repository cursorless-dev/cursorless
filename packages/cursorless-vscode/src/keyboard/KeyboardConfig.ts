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
      this.vscodeApi.workspace.getConfiguration<KeyMap<SectionTypes[S]>>(
        `cursorless.experimental.keyboard.modal.keybindings.${sectionName}`,
      );

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
   * `only` is provided, we filter to include only entries with these values.
   *
   * Example:
   *
   * ```ts
   * assert.equal(
   *   getTokenKeyMap("direction", "misc", ["forward", "backward"]),
   *   {
   *     "f": { type: "direction", value: "forward" },
   *     "b": { type: "direction", value: "backward" },
   *   },
   * );
   * ```
   *
   * @param tokenType The type of the token
   * @param sectionName The name of the config section
   * @param only If provided, only entries with these values will be returned
   * @returns A keymap with entries only for the given value
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
  >(tokenType: T, sectionName: K, only: V[]): KeyMap<{ type: T; value: V }>;
  getTokenKeyMap<
    T extends TokenType,
    K extends keyof SectionTypes,
    V extends SectionTypes[K] & TokenTypeValueMap[T] = SectionTypes[K] &
      TokenTypeValueMap[T],
  >(
    tokenType: T,
    sectionName: K = tokenType as unknown as K,
    only?: V[],
  ): KeyMap<{ type: T; value: V }> {
    const section = this.getSectionKeyMapRaw(sectionName);

    if (only == null) {
      return mapValues(section, (value) => ({
        type: tokenType,
        value: value as V,
      }));
    }

    return mapValues(
      pickBy(section, (v): v is V => only.includes(v as V)),
      (value) => ({
        type: tokenType,
        value,
      }),
    );
  }
}
