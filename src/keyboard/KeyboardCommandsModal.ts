import * as vscode from "vscode";
import { Graph } from "../typings/Types";
import { topLevelKeys } from "./Keymaps";

/**
 * Defines a mode to use with a modal version of Cursorless keyboard.
 */
export default class KeyboardCommandsModal {
  private isModeOn = false;
  private isActivated = false;
  private inputDisposable: vscode.Disposable | undefined;

  constructor(private graph: Graph) {
    this.modeOn = this.modeOn.bind(this);
    this.modeOff = this.modeOff.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  init() {
    this.graph.extensionContext.subscriptions.push(
      vscode.commands.registerCommand(
        "cursorless.keyboard.modal.modeOn",
        this.modeOn
      ),
      vscode.commands.registerCommand(
        "cursorless.keyboard.modal.modeOff",
        this.modeOff
      ),
      vscode.window.onDidChangeActiveTextEditor((textEditor) => {
        if (!textEditor) {
          return;
        }
        this.ensureState();
      })
    );

    this.ensureState();
  }

  private modeOn = () => {
    this.isModeOn = true;
    this.isActivated = true;

    vscode.commands.executeCommand(
      "setContext",
      "cursorless.keyboard.modal.mode",
      true
    );

    this.inputDisposable =
      this.graph.keyboardCommands.keyboardHandler.pushListener(this);

    this.ensureState();
  };

  handleInput(text: string) {
    console.log(`Got keypress: ${text}`);
    const command = topLevelKeys[text];
    const [commandType, commandPayload] = command.split(".");
  }

  private modeOff = () => {
    this.isModeOn = false;

    vscode.commands.executeCommand(
      "setContext",
      "cursorless.keyboard.modal.mode",
      false
    );

    this.inputDisposable?.dispose();
    this.inputDisposable = undefined;

    this.ensureState();
  };

  private ensureState = () => {
    if (!this.isActivated) {
      return;
    }

    this.ensureCursorStyle();
  };

  private ensureCursorStyle() {
    if (!vscode.window.activeTextEditor) {
      return;
    }

    const cursorStyle = this.isModeOn
      ? vscode.TextEditorCursorStyle.LineThin
      : vscode.TextEditorCursorStyle.Line;

    const currentCursorStyle =
      vscode.window.activeTextEditor.options.cursorStyle;

    if (currentCursorStyle !== cursorStyle) {
      vscode.window.activeTextEditor.options = {
        cursorStyle: cursorStyle,
      };
    }
  }
}
