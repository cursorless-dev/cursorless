import { keys, toPairs } from "lodash";
import * as vscode from "vscode";
import KeyboardHandler from "./KeyboardHandler";
import { KeyMap } from "./TokenTypeHelpers";

/**
 * Defines a single keyboard layer to use with a modal version of Cursorless
 * keyboard. We construct one of these every time the parser changes state,
 * based on the allowable tokens at the given state.
 */
export class KeyboardCommandsModalLayer<Param extends { type: any }> {
  /**
   * Merged map from all the different sections of the key map (eg actions,
   * colors, etc).
   */
  private mergedKeymap: Record<string, Param> = {};

  constructor(
    private keyboardHandler: KeyboardHandler,
    sections: KeyMap<Param>[],
  ) {
    this.handleInput = this.handleInput.bind(this);
    for (const section of sections) {
      this.handleSection(section);
    }
    this.addShortVersions();
  }

  /**
   * Adds a section (eg actions, scopes, etc) to the merged keymap.
   *
   * @param sectionName The name of the section (eg `"actions"`, `"scopes"`, etc)
   * @param defaultKeyMap The default values for this keymap
   * @param handleValue The function to call when the user presses the given key
   */
  private handleSection<T extends Param>(keyMap: KeyMap<T>) {
    for (const [key, entry] of toPairs(keyMap)) {
      const conflicting = this.getConflictingKeyMapEntry(key);
      if (conflicting != null) {
        const [conflictingKey, conflictingEntry] = conflicting;
        vscode.window.showErrorMessage(
          `Conflicting keybindings: \`${entry.type}.${key}\` and \`${conflictingEntry.type}.${conflictingKey}\``,
        );

        continue;
      }

      this.mergedKeymap[key] = entry;
    }
  }

  /**
   * Adds support for using any suffix of a keybinding if it doesn't conflict
   * with any other keybinding.
   */
  private addShortVersions() {
    const keys = Object.keys(this.mergedKeymap);
    for (const key of keys) {
      let suffix = key;
      while (suffix.length > 1) {
        suffix = suffix.slice(1);
        if (this.getConflictingKeyMapEntry(suffix) == null) {
          this.mergedKeymap[suffix] = this.mergedKeymap[key];
        }
      }
    }
  }

  async handleInput(text: string): Promise<Param | undefined> {
    if (!this.isPrefixOfKey("")) {
      throw Error("No keys in keymap for current layer");
    }

    if (!this.isPrefixOfKey(text)) {
      // If we haven't consumed any input yet, then it means the first
      // character was a false start so we should cancel the whole thing.
      const errorMessage = `Invalid key '${text}'`;
      vscode.window.showErrorMessage(errorMessage);
      throw new Error(errorMessage);
    }

    let sequence = text;
    let value: Param | undefined = this.mergedKeymap[sequence];

    // We handle multi-key sequences by repeatedly awaiting a single keypress
    // until they've pressed something in the map.
    while (value == null) {
      const nextKey = await this.keyboardHandler.awaitSingleKeypress({
        cursorStyle: vscode.TextEditorCursorStyle.Underline,
        whenClauseContext: "cursorless.keyboard.targeted.awaitingKeys",
        statusBarText: "Finish sequence...",
      });

      if (nextKey == null) {
        return undefined;
      }

      const possibleNextSequence = sequence + nextKey;
      if (!this.isPrefixOfKey(possibleNextSequence)) {
        const errorMessage = `Invalid key '${nextKey}'`;
        vscode.window.showErrorMessage(errorMessage);
        continue;
      }

      sequence = possibleNextSequence;
      value = this.mergedKeymap[sequence];
    }

    return value;
  }

  private isPrefixOfKey(text: string): boolean {
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
  private getConflictingKeyMapEntry(text: string): [string, Param] | undefined {
    const conflictingPair = toPairs(this.mergedKeymap).find(
      ([key]) => text.startsWith(key) || key.startsWith(text),
    );

    return conflictingPair == null ? undefined : conflictingPair;
  }
}
