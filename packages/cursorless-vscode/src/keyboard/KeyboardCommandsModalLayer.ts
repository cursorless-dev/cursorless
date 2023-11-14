import { isTesting } from "@cursorless/common";
import { keys, merge, toPairs } from "lodash";
import * as vscode from "vscode";
import KeyboardHandler from "./KeyboardHandler";
import { Keymap } from "./defaultKeymaps";

type SectionName =
  | "actions"
  | "colors"
  | "misc"
  | "scopes"
  | "shapes"
  | "vscodeCommands";

interface KeyHandler<T> {
  sectionName: SectionName;
  value: T;
  handleValue(): Promise<unknown>;
}

/**
 * Defines a mode to use with a modal version of Cursorless keyboard.
 */
export class KeyboardCommandsModalLayer {
  /**
   * Merged map from all the different sections of the key map (eg actions,
   * colors, etc).
   */
  private mergedKeymap!: Record<string, KeyHandler<any>>;

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
    handleValue: (value: T) => Promise<unknown>,
  ) {
    const userOverrides: Keymap<T> = isTesting()
      ? {}
      : vscode.workspace
          .getConfiguration(
            "cursorless.experimental.keyboard.modal.keybindings",
          )
          .get<Keymap<T>>(sectionName) ?? {};
    const keyMap = merge({}, defaultKeyMap, userOverrides);

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

      const entry: KeyHandler<T> = {
        sectionName,
        value,
        handleValue: () => handleValue(value),
      };

      this.mergedKeymap[key] = entry;
    }
  }

  async handleInput(text: string) {
    let sequence = text;
    let keyHandler: KeyHandler<any> | undefined = this.mergedKeymap[sequence];

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
        return;
      }

      sequence += nextKey;
      keyHandler = this.mergedKeymap[sequence];
    }

    return await keyHandler.handleValue();
  }

  isPrefixOfKey(text: string): boolean {
    return keys(this.mergedKeymap).some((key) => key.startsWith(text));
  }

  /**
   * This function can be used to detect if a proposed map entry conflicts with
   * one in the map.  Used to detect if the user tries to use two map entries,
   * one of which is a prefix of the other.
   * @param text The proposed new map entry
   * @returns The first map entry that conflicts with {@link text}, if one
   * exists
   */
  getConflictingKeyMapEntry(text: string): KeyHandler<any> | undefined {
    const conflictingPair = toPairs(this.mergedKeymap).find(
      ([key]) => text.startsWith(key) || key.startsWith(text),
    );

    return conflictingPair == null ? undefined : conflictingPair[1];
  }
}
