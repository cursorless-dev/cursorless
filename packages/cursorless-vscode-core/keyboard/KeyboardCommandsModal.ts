import { keys, merge, toPairs } from "lodash";
import * as vscode from "vscode";
import {
  DEFAULT_ACTION_KEYMAP,
  DEFAULT_COLOR_KEYMAP,
  Keymap,
  DEFAULT_SCOPE_KEYMAP,
  DEFAULT_SHAPE_KEYMAP,
} from "./defaultKeymaps";
import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import KeyboardHandler from "./KeyboardHandler";

type SectionName = "actions" | "scopes" | "colors" | "shapes";

interface KeyHandler<T> {
  sectionName: SectionName;
  value: T;
  handleValue(): Promise<unknown>;
}

/**
 * Defines a mode to use with a modal version of Cursorless keyboard.
 */
export default class KeyboardCommandsModal {
  /**
   * This disposable is returned by {@link KeyboardHandler.pushListener}, and is
   * used to relinquich control of the keyboard.  If this disposable is
   * non-null, then our mode is active.
   */
  private inputDisposable: vscode.Disposable | undefined;

  /**
   * Merged map from all the different sections of the key map (eg actions,
   * colors, etc).
   */
  private mergedKeymap!: Record<string, KeyHandler<any>>;

  constructor(
    private extensionContext: vscode.ExtensionContext,
    private targeted: KeyboardCommandsTargeted,
    private keyboardHandler: KeyboardHandler,
  ) {
    this.modeOn = this.modeOn.bind(this);
    this.modeOff = this.modeOff.bind(this);
    this.handleInput = this.handleInput.bind(this);

    this.constructMergedKeymap();
  }

  init() {
    this.extensionContext.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (
          event.affectsConfiguration(
            "cursorless.experimental.keyboard.modal.keybindings",
          )
        ) {
          this.constructMergedKeymap();
        }
      }),
    );
  }

  private constructMergedKeymap() {
    this.mergedKeymap = {};

    this.handleSection("actions", DEFAULT_ACTION_KEYMAP, (value) =>
      this.targeted.performActionOnTarget(value),
    );
    this.handleSection("scopes", DEFAULT_SCOPE_KEYMAP, (value) =>
      this.targeted.targetScopeType({
        scopeType: value,
      }),
    );
    this.handleSection("colors", DEFAULT_COLOR_KEYMAP, (value) =>
      this.targeted.targetDecoratedMark({
        color: value,
      }),
    );
    this.handleSection("shapes", DEFAULT_SHAPE_KEYMAP, (value) =>
      this.targeted.targetDecoratedMark({
        shape: value,
      }),
    );
  }

  /**
   * Adds a section (eg actions, scopes, etc) to the merged keymap.
   *
   * @param sectionName The name of the section (eg `"actions"`, `"scopes"`, etc)
   * @param defaultKeyMap The default values for this keymap
   * @param handleValue The function to call when the user presses the given key
   */
  private handleSection<T>(
    sectionName: SectionName,
    defaultKeyMap: Keymap<T>,
    handleValue: (value: T) => Promise<unknown>,
  ) {
    const userOverrides: Keymap<T> =
      vscode.workspace
        .getConfiguration("cursorless.experimental.keyboard.modal.keybindings")
        .get<Keymap<T>>(sectionName) ?? {};
    const keyMap = merge({}, defaultKeyMap, userOverrides);

    for (const [key, value] of toPairs(keyMap)) {
      const conflictingEntry = this.getConflictingKeyMapEntry(key);
      if (conflictingEntry != null) {
        const { sectionName: conflictingSection, value: conflictingValue } =
          conflictingEntry;

        vscode.window.showErrorMessage(
          `Conflicting keybindings: \`${sectionName}.${value}\` and \`${conflictingSection}.${conflictingValue}\` both want key '${key}'`,
        );

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

  modeOn = async () => {
    if (this.isModeOn()) {
      return;
    }

    this.inputDisposable = this.keyboardHandler.pushListener({
      handleInput: this.handleInput,
      displayOptions: {
        cursorStyle: vscode.TextEditorCursorStyle.BlockOutline,
        whenClauseContext: "cursorless.keyboard.modal.mode",
        statusBarText: "Listening...",
      },
      handleCancelled: this.modeOff,
    });

    // Set target to current selection when we enter the mode
    await this.targeted.targetSelection();
  };

  modeOff = async () => {
    if (!this.isModeOn()) {
      return;
    }

    this.inputDisposable?.dispose();
    this.inputDisposable = undefined;

    // Clear target upon exiting mode; this will remove the highlight
    await this.targeted.clearTarget();
  };

  modeToggle = () => {
    if (this.isModeOn()) {
      this.modeOff();
    } else {
      this.modeOn();
    }
  };

  private isModeOn() {
    return this.inputDisposable != null;
  }

  async handleInput(text: string) {
    let sequence = text;
    let keyHandler: KeyHandler<any> | undefined = this.mergedKeymap[sequence];

    // We handle multi-key sequences by repeatedly awaiting a single keypress
    // until they've pressed somethign in the map.
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

    keyHandler.handleValue();
  }

  isPrefixOfKey(text: string): boolean {
    return keys(this.mergedKeymap).some((key) => key.startsWith(text));
  }

  /**
   * This function can be used to deterct if a proposed map entry conflicts with
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
