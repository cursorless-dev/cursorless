import { mapValues, pickBy } from "lodash";
import { KeyMap, SectionName, TokenType } from "./TokenTypeHelpers";
import { SectionTypes, TokenTypeValueMap } from "./TokenTypes";
import { VscodeApi } from "@cursorless/vscode-common";
import { TextEditorCursorStyle } from "vscode";

const LEGACY_PLURAL_SECTION_NAMES: Record<string, string> = {
  action: "actions",
  color: "colors",
  shape: "shapes",
  vscodeCommand: "vscodeCommands",
  scope: "scopes",
};

/**
 * Maps from the raw cursor style config value to the corresponding
 * TextEditorCursorStyle enum value.
 */
const cursorStyleMap = {
  line: TextEditorCursorStyle.Line,
  block: TextEditorCursorStyle.Block,
  underline: TextEditorCursorStyle.Underline,
  ["line-thin"]: TextEditorCursorStyle.LineThin,
  ["block-outline"]: TextEditorCursorStyle.BlockOutline,
  ["underline-thin"]: TextEditorCursorStyle.UnderlineThin,
} satisfies Record<string, TextEditorCursorStyle>;

export class KeyboardConfig {
  constructor(private vscodeApi: VscodeApi) {}

  getCursorStyle(): TextEditorCursorStyle {
    const rawCursorStyle = this.vscodeApi.workspace
      .getConfiguration("cursorless.experimental.keyboard.modal")
      .get<keyof typeof cursorStyleMap>("cursorStyle");

    if (rawCursorStyle == null) {
      return TextEditorCursorStyle.BlockOutline;
    }

    return cursorStyleMap[rawCursorStyle];
  }

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
   * {@link transform} is provided, it's used to transform each entry, dropping
   * the ones for which {@link transform} returns `undefined`.
   *
   * Example:
   *
   * ```ts
   * assert.equal(
   *   getTokenKeyMap("direction", "misc", only("forward", "backward")),
   *   {
   *     "f": { type: "direction", value: "forward" },
   *     "b": { type: "direction", value: "backward" },
   *   },
   * );
   * ```
   *
   * @param tokenType The type of the token
   * @param sectionName The name of the config section
   * @param transform If provided, a function that transforms each entry,
   * returning `undefined` for entries to be dropped
   * @returns A keymap with transformed entries for the given config section,
   * without entries for which {@link transform} returns `undefined`
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
    V extends TokenTypeValueMap[T] = TokenTypeValueMap[T],
  >(
    tokenType: T,
    sectionName: K,
    transform: (value: SectionTypes[K]) => V | undefined,
  ): KeyMap<{ type: T; value: V }>;
  getTokenKeyMap<
    T extends TokenType,
    K extends keyof SectionTypes,
    V extends TokenTypeValueMap[T] = TokenTypeValueMap[T],
  >(
    tokenType: T,
    sectionName: K = tokenType as unknown as K,
    transform?: (value: SectionTypes[K]) => V | undefined,
  ): KeyMap<{ type: T; value: V | SectionTypes[K] }> {
    const section = this.getSectionKeyMapRaw(sectionName);

    if (transform == null) {
      return mapValues<
        KeyMap<SectionTypes[K]>,
        {
          type: T;
          value: SectionTypes[K];
        }
      >(section, (value) => ({
        type: tokenType,
        value: value,
      }));
    }

    return pickBy<
      {
        type: T;
        value: V | undefined;
      },
      {
        type: T;
        value: V;
      }
    >(
      mapValues(section, (value) => ({
        type: tokenType,
        value: transform(value),
      })),
      (value): value is { type: T; value: V } => value.value != null,
    );
  }
}

/**
 * Creates a transform function that leaves only the values that are included in
 * {@link values}.
 *
 * @param values Values to include
 * @returns A filter function suitable for use with getTokenKeyMap
 */
export function only<T, V extends T>(
  ...values: V[]
): (value: T) => V | undefined {
  return (value: T) => (values.includes(value as V) ? (value as V) : undefined);
}
