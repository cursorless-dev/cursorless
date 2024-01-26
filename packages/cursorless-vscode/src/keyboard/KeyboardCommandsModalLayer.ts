import * as vscode from "vscode";
import KeyboardHandler from "./KeyboardHandler";
import TrieSearch from "trie-search";
import { buildSuffixTrie, KeyValuePair } from "./buildSuffixTrie";

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
  private trie: TrieSearch<{
    key: string;
    value: Param;
  }>;

  constructor(
    private keyboardHandler: KeyboardHandler,
    entries: [string, Param][],
  ) {
    this.handleInput = this.handleInput.bind(this);
    if (entries.length === 0) {
      vscode.window.showErrorMessage("No keybindings found for current layer");
    }
    const { trie, conflicts } = buildSuffixTrie(entries);

    for (const conflict of conflicts) {
      const conflictStr = conflict
        .map(({ key, value: { type } }) => `\`${type}.${key}\``)
        .join(" and ");
      vscode.window.showErrorMessage(`Conflicting keybindings: ${conflictStr}`);
    }

    this.trie = trie;
  }

  async handleInput(text: string, { previousKeys }: { previousKeys: string }) {
    let values: KeyValuePair<Param>[];

    if (text === "") {
      values = [];
    } else {
      values = this.trie.search(text);

      if (values.length === 0) {
        // If we haven't consumed any input yet, then it means the first
        // character was a false start so we should cancel the whole thing.
        const errorMessage = `Invalid key '${text}'`;
        vscode.window.showErrorMessage(errorMessage);
        throw Error(errorMessage);
      }
    }

    let sequence = text;

    // We handle multi-key sequences by repeatedly awaiting a single keypress
    // until they've pressed something in the map.
    while (values.length !== 1) {
      const nextKey = await this.keyboardHandler.awaitSingleKeypress({
        cursorStyle: vscode.TextEditorCursorStyle.Underline,
        whenClauseContext: "cursorless.keyboard.targeted.awaitingKeys",
        statusBarText: `${previousKeys + sequence}...`,
      });

      if (nextKey == null) {
        return undefined;
      }

      const possibleNextSequence = sequence + nextKey;
      const possibleNextValues = this.trie.search(possibleNextSequence);
      if (possibleNextValues.length === 0) {
        const errorMessage = `Invalid key '${nextKey}'`;
        vscode.window.showErrorMessage(errorMessage);
        continue;
      }

      sequence = possibleNextSequence;
      values = possibleNextValues;
    }

    return { keysPressed: sequence, value: values[0].value };
  }
}
