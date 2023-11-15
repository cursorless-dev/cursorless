import { toPairs } from "lodash";
import * as vscode from "vscode";
import KeyboardHandler from "./KeyboardHandler";
import { Keymap } from "./defaultKeymaps";
import { getSectionKeyMap } from "./getSectionKeyMap";
import { KeyHandler, SectionName } from "./KeyHandler";

/**
 * Defines a mode to use with a modal version of Cursorless keyboard.
 */
export class KeyboardCommandsModalLayer<V = unknown> {
  /**
   * Merged map from all the different sections of the key map (eg actions,
   * colors, etc).
   */
  private mergedKeymap!: Record<string, KeyHandler<unknown, V>>;

  constructor(
    private keyboardHandler: KeyboardHandler,
    private options: {
      reportConflicts: boolean;
    },
  ) {
    this.handleInput = this.handleInput.bind(this);
  }

  clear() {
    this.mergedKeymap = {};
  }

  /**
   * Adds a section (eg actions, scopes, etc) to the merged keymap.
   *
   * @param sectionName The name of the section (eg `"actions"`, `"scopes"`, etc)
   * @param defaultKeyMap The default values for this keymap
   * @param handleValue The function to call when the user presses the given key
   */
  handleSection<T>(
    sectionName: SectionName,
    defaultKeyMap: Keymap<T>,
    handleValue: (value: T) => Promise<V>,
  ) {
    const keyMap = getSectionKeyMap<T>(sectionName, defaultKeyMap);

    for (const [key, value] of toPairs(keyMap)) {
      const conflictingEntry = this.getConflictingKeyMapEntry(key);
      if (conflictingEntry != null) {
        if (this.options.reportConflicts) {
          const { sectionName: conflictingSection, value: conflictingValue } =
            conflictingEntry;

          vscode.window.showErrorMessage(
            `Conflicting keybindings: \`${sectionName}.${value}\` and \`${conflictingSection}.${conflictingValue}\` both want key '${key}'`,
          );
        }

        continue;
      }

      const entry: KeyHandler<T, V> = {
        sectionName,
        value,
        handleValue: () => handleValue(value),
      };

      this.mergedKeymap[key] = entry;
    }
  }

  async handleInput(text: string): Promise<V | undefined> {
    let sequence = text;
    let keyHandler: KeyHandler<unknown, V> | undefined =
      this.mergedKeymap[sequence];

    // We handle multi-key sequences by repeatedly awaiting a single keypress
    // until they've pressed something in the map.
    while (keyHandler == null) {
      if (!this.isPrefixOfKey(sequence)) {
        const errorMessage = `Unknown key sequence "${sequence}"`;
        vscode.window.showErrorMessage(errorMessage);
        throw Error(errorMessage);
      }

      const nextKey = await this.keyboardHandler.awaitSingleKeypress({
        cursorStyle: vscode.TextEditorCursorStyle.Underline,
        whenClauseContext: "cursorless.keyboard.targeted.awaitingKeys",
        statusBarText: "Finish sequence...",
      });

      if (nextKey == null) {
        return undefined;
      }

      sequence += nextKey;
      keyHandler = this.mergedKeymap[sequence];
    }

    return await keyHandler.handleValue();
  }
}
