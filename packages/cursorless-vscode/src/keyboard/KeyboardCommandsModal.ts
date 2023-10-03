import * as vscode from "vscode";

import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import KeyboardHandler from "./KeyboardHandler";
import { executeCursorlessCommand } from "./KeyboardCommandsTargeted";
import Keymap from "./Keymap";





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
  
  cursorOffset: vscode.Position;
  private keymap: Keymap;
  

  constructor(
    private extensionContext: vscode.ExtensionContext,
    private targeted: KeyboardCommandsTargeted,
    private keyboardHandler: KeyboardHandler,
  ) {
    this.modeOn = this.modeOn.bind(this);
    this.modeOff = this.modeOff.bind(this);
    this.handleInput = this.handleInput.bind(this);

    // this.constructMergedKeymap();
    this.cursorOffset = new vscode.Position(0, 0);
    this.keymap = new Keymap();
    
  }

  init() {
    this.extensionContext.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (
          event.affectsConfiguration(
            "cursorless.experimental.keyboard.modal.keybindings",
          )
        ) {
          this.keymap.loadKeymap();
        }
      }),
    );
    
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


  private async  setTargetToCursor() {
    await executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    });
  }

  async handleInput(text: string) {
    let sequence = text;
    // let keyHandler: KeyHandler<any> | undefined = this.mergedKeymap[sequence];

    const map = this.keymap.getMergeKeys()
    let hasHandler = map.includes(sequence);




    // We handle multi-key sequences by repeatedly awaiting a single keypress
    // until they've pressed something in the map.
    while (!hasHandler) {      

      if (!this.keymap.isPrefixOfMapEntry(sequence)) {
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
      hasHandler = this.keymap.getMergeKeys().includes(sequence);
    }
    const curCursorOffset = vscode.window.activeTextEditor?.selection.active;
    if (curCursorOffset != null && this.cursorOffset != null) {
      if (!curCursorOffset.isEqual(this.cursorOffset) ) {
        await this.setTargetToCursor();
        }
    }
    this.handleSequence(sequence);
    if (curCursorOffset != null) {
      this.cursorOffset = curCursorOffset;
    }
  }


  private handleSequence(sequence: string) {
    const sectionName = this.keymap.getKeyValue(sequence);
    if (sectionName == null) {
      return;
    }
    const [section, value] = sectionName;
    switch (section) {
      case "actions":
        this.targeted.performActionOnTarget(value);
        break;
      case "scopes":
        this.targeted.targetScopeType({
          scopeType: value,
        });
        break;
      case "colors":
        this.targeted.targetDecoratedMark({
          color: value,
        },this.keymap);
        break;
      case "shapes":
        this.targeted.targetDecoratedMark({
          shape: value,
        }, this.keymap);
        break;
      case "modifiers":
        this.targeted.targetModifierType("interiorOnly");
        break;
    }
  }

}
