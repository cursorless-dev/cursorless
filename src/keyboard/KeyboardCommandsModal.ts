import { toPairs } from "lodash";
import * as vscode from "vscode";
import { ActionType } from "../actions/actions.types";
import { Graph } from "../typings/Types";
import { actionKeymap, colorKeymap, KeyMap, scopeKeymap } from "./Keymaps";

type SectionName = "actions" | "scopes" | "colors";

interface KeyHandler<T> {
  sectionName: SectionName;
  value: T;
  handleValue(): void;
}

/**
 * Defines a mode to use with a modal version of Cursorless keyboard.
 */
export default class KeyboardCommandsModal {
  private isModeOn = false;
  private isActivated = false;
  private inputDisposable: vscode.Disposable | undefined;
  private mergedKeymap!: Record<string, KeyHandler<any>>;

  constructor(private graph: Graph) {
    this.modeOn = this.modeOn.bind(this);
    this.modeOff = this.modeOff.bind(this);
    this.handleInput = this.handleInput.bind(this);

    this.constructMergedKeymap();
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

  private constructMergedKeymap() {
    this.mergedKeymap = {};

    this.handleSection("actions", actionKeymap, (value) => {
      return this.graph.keyboardCommands.targeted.performActionOnTarget(value);
    });
    this.handleSection("scopes", scopeKeymap, (value) => {
      return this.graph.keyboardCommands.targeted.targetScopeType({
        scopeType: value,
      });
    });
    this.handleSection("colors", colorKeymap, (value) => {
      return this.graph.keyboardCommands.targeted.targetDecoratedMark({
        color: value,
      });
    });
  }

  private handleSection<T>(
    sectionName: SectionName,
    keyMap: KeyMap<T>,
    handleValue: (value: T) => void
  ) {
    for (const [key, value] of toPairs(keyMap)) {
      if (key in this.mergedKeymap) {
        const { sectionName: conflictingSection, value: conflictingValue } =
          this.mergedKeymap[key];

        vscode.window.showErrorMessage(
          `Duplicated keybindings: ${sectionName} ${value} and ${conflictingSection} ${conflictingValue} both want key '${key}'`
        );

        return;
      }

      const entry: KeyHandler<T> = {
        sectionName,
        value,
        handleValue: () => handleValue(value),
      };

      this.mergedKeymap[key] = entry;
    }
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
    this.mergedKeymap[text].handleValue();
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

  private handleAction(action: ActionType) {
    return this.graph.keyboardCommands.targeted.performActionOnTarget(action);
  }
}
