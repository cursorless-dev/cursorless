import * as vscode from "vscode";
import { KeyboardCommandsModalLayer } from "./KeyboardCommandsModalLayer";
import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import KeyboardHandler from "./KeyboardHandler";
import {
  DEFAULT_ACTION_KEYMAP,
  DEFAULT_COLOR_KEYMAP,
  DEFAULT_MISC_KEYMAP,
  DEFAULT_SCOPE_KEYMAP,
  DEFAULT_SHAPE_KEYMAP,
  DEFAULT_VSCODE_COMMAND_KEYMAP,
  ModalVscodeCommandDescriptor,
} from "./defaultKeymaps";

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
  private rootLayer: KeyboardCommandsModalLayer;

  constructor(
    private extensionContext: vscode.ExtensionContext,
    private targeted: KeyboardCommandsTargeted,
    private keyboardHandler: KeyboardHandler,
  ) {
    this.modeOn = this.modeOn.bind(this);
    this.modeOff = this.modeOff.bind(this);

    this.rootLayer = new KeyboardCommandsModalLayer(keyboardHandler, {
      reportConflicts: true,
    });

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

  private async handleVscodeCommand(commandInfo: ModalVscodeCommandDescriptor) {
    const {
      commandId,
      args,
      executeAtTarget,
      keepChangedSelection,
      exitCursorlessMode,
    } =
      typeof commandInfo === "string" || commandInfo instanceof String
        ? ({ commandId: commandInfo } as Exclude<
            ModalVscodeCommandDescriptor,
            string
          >)
        : commandInfo;
    if (executeAtTarget) {
      return await this.targeted.performVscodeCommandOnTarget(commandId, {
        args,
        keepChangedSelection,
        exitCursorlessMode,
      });
    }
    return await vscode.commands.executeCommand(commandId, ...(args ?? []));
  }

  private constructMergedKeymap() {
    this.rootLayer.clear();

    this.rootLayer.handleSection(
      "actions",
      DEFAULT_ACTION_KEYMAP,
      async (value) => {
        // Note: We don't await this, in case the action hangs
        this.targeted.performActionOnTarget(value);
      },
    );
    this.rootLayer.handleSection("scopes", DEFAULT_SCOPE_KEYMAP, (value) =>
      this.targeted.targetScopeType({
        scopeType: value,
      }),
    );
    this.rootLayer.handleSection("colors", DEFAULT_COLOR_KEYMAP, (value) =>
      this.targeted.targetDecoratedMark({
        color: value,
      }),
    );
    this.rootLayer.handleSection("shapes", DEFAULT_SHAPE_KEYMAP, (value) =>
      this.targeted.targetDecoratedMark({
        shape: value,
      }),
    );
    this.rootLayer.handleSection(
      "vscodeCommands",
      DEFAULT_VSCODE_COMMAND_KEYMAP,
      async (value) => {
        // Note: We don't await this, in case the command hangs
        this.handleVscodeCommand(value);
      },
    );
    const combineColorAndShapeLayer = this.getColorShapeLayer();
    this.rootLayer.handleSection("misc", DEFAULT_MISC_KEYMAP, async (value) => {
      switch (value) {
        case "combineColorAndShape":
          return await combineColorAndShapeLayer.handleInput("");
        case "makeRange":
          return this.targeted.targetDecoratedMark({
            mode: "extend",
          });
        case "makeList":
          return this.targeted.targetDecoratedMark({
            mode: "append",
          });
      }
    });
  }

  modeOn = async () => {
    if (this.isModeOn()) {
      return;
    }

    this.inputDisposable = this.keyboardHandler.pushListener({
      handleInput: this.rootLayer.handleInput,
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

  private getColorShapeLayer() {
    const shapeLayer = new KeyboardCommandsModalLayer(this.keyboardHandler, {
      reportConflicts: false,
    });
    shapeLayer.handleSection("shapes", DEFAULT_SHAPE_KEYMAP, async (value) => {
      return await shapeLayer.handleInput("");
    });

    const combineColorAndShapeLayer = new KeyboardCommandsModalLayer(
      this.keyboardHandler,
      {
        reportConflicts: false,
      },
    );
    combineColorAndShapeLayer.handleSection(
      "colors",
      DEFAULT_COLOR_KEYMAP,
      async (color) => {
        const colorLayer = new KeyboardCommandsModalLayer(
          this.keyboardHandler,
          {
            reportConflicts: false,
          },
        );
        colorLayer.handleSection(
          "colors",
          DEFAULT_COLOR_KEYMAP,
          async (shape) => {
            return await colorLayer.handleInput("");
          },
        );
        return await combineColorAndShapeLayer.handleInput("");
      },
    );
    combineColorAndShapeLayer.handleSection(
      "shapes",
      DEFAULT_SHAPE_KEYMAP,
      async (value) => {
        currentShape = value;
      },
    );
    return combineColorAndShapeLayer;
  }

  private isModeOn() {
    return this.inputDisposable != null;
  }
}
