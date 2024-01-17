import {
  ActionDescriptor,
  LATEST_VERSION,
  Modifier,
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
  ScopeType,
} from "@cursorless/common";
import { runCursorlessCommand } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import type { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import { getStyleName } from "../ide/vscode/hats/getStyleName";
import KeyboardCommandsModal from "./KeyboardCommandsModal";
import KeyboardHandler from "./KeyboardHandler";
import { KeyboardActionDescriptor } from "./KeyboardActionType";
import { isString } from "./KeyboardCommandHandler";

type TargetingMode = "replace" | "extend" | "append";

interface TargetDecoratedMarkArgument {
  color?: HatColor;
  shape?: HatShape;
  character?: string;
  /**
   * Indicates if the current target should be replaced by the given mark, or if
   * we should create a range (using existing target as anchor), or a list.
   */
  mode?: TargetingMode;
}

interface ModifyTargetContainingScopeArgument {
  scopeType: ScopeType;
  type?: "containingScope" | "everyScope";
}

/**
 * Defines a set of commands which are designed to work together for designing a
 * keyboard interface. The commands set highlights and allow you to perform
 * actions on highlighted targets.
 */
export default class KeyboardCommandsTargeted {
  private modal!: KeyboardCommandsModal;

  constructor(private keyboardHandler: KeyboardHandler) {
    this.targetDecoratedMark = this.targetDecoratedMark.bind(this);
    this.performActionOnTarget = this.performActionOnTarget.bind(this);
    this.performVscodeCommandOnTarget =
      this.performVscodeCommandOnTarget.bind(this);
    this.modifyTargetContainingScope =
      this.modifyTargetContainingScope.bind(this);
    this.targetSelection = this.targetSelection.bind(this);
    this.clearTarget = this.clearTarget.bind(this);
  }

  init(modal: KeyboardCommandsModal) {
    this.modal = modal;
  }

  /**
   * Sets the highlighted target to the given decorated mark. If {@link character} is
   * omitted, then we wait for the user to press a character
   * @param param0 Describes the desired targeted mark
   * @returns A promise that resolves to the result of the cursorless command
   */
  targetDecoratedMark = async ({
    color = "default",
    shape = "default",
    character,
    mode = "replace",
  }: TargetDecoratedMarkArgument) => {
    character =
      character ??
      (await this.keyboardHandler.awaitSingleKeypress({
        cursorStyle: vscode.TextEditorCursorStyle.Underline,
        whenClauseContext: "cursorless.keyboard.targeted.awaitingHatCharacter",
        statusBarText: "Which hat?",
      }));

    if (character == null) {
      // Cancelled
      return;
    }

    let target: PartialTargetDescriptor = {
      type: "primitive",
      mark: {
        type: "decoratedSymbol",
        symbolColor: getStyleName(color, shape),
        character,
      },
    };

    switch (mode) {
      case "extend":
        target = {
          type: "range",
          anchor: {
            type: "primitive",
            mark: {
              type: "that",
            },
          },
          active: target,
          excludeActive: false,
          excludeAnchor: false,
        };
        break;
      case "append":
        target = {
          type: "list",
          elements: [
            {
              type: "primitive",
              mark: {
                type: "that",
              },
            },
            target,
          ],
        };
        break;
      case "replace":
        break;
    }

    return await executeCursorlessCommand({
      name: "private.setKeyboardTarget",
      target,
    });
  };

  /**
   * Expands the current target to the containing {@link scopeType}
   * @param param0 Describes the desired scope type
   * @returns A promise that resolves to the result of the cursorless command
   */
  modifyTargetContainingScope = async ({
    scopeType,
    type = "containingScope",
  }: ModifyTargetContainingScopeArgument) =>
    await executeCursorlessCommand({
      name: "private.setKeyboardTarget",
      target: {
        type: "primitive",
        modifiers: [
          {
            type,
            scopeType,
          },
        ],
        mark: {
          type: "keyboard",
        },
      },
    });

  /**
   * Applies {@link modifier} to the current target
   * @param param0 Describes the desired modifier
   * @returns A promise that resolves to the result of the cursorless command
   */
  targetModifier = async (modifier: Modifier) =>
    await executeCursorlessCommand({
      name: "private.setKeyboardTarget",
      target: {
        type: "primitive",
        modifiers: [modifier],
        mark: {
          type: "keyboard",
        },
      },
    });

  /**
   * Performs action {@link name} on the current target
   * @param name The action to run
   * @returns A promise that resolves to the result of the cursorless command
   */
  performSimpleActionOnTarget = async (
    actionDescription: KeyboardActionDescriptor,
  ) => {
    let name = "";
    let exitCursorlessMode = false;
    if (isString(actionDescription)) {
      name = actionDescription;
    } else {
      name = actionDescription.actionId;
      exitCursorlessMode = actionDescription.exitCursorlessMode ?? false;
    }

    return this.performActionOnTarget(
      (target: PartialPrimitiveTargetDescriptor) => {
        let action: ActionDescriptor;
        switch (name) {
          case "wrapWithPairedDelimiter":
          case "rewrapWithPairedDelimiter":
          case "insertSnippet":
          case "wrapWithSnippet":
          case "executeCommand":
          case "replace":
          case "editNew":
          case "getText":
            throw Error(`Unsupported keyboard action: ${name}`);
          case "replaceWithTarget":
          case "moveToTarget":
            action = {
              name,
              source: target,
              destination: { type: "implicit" },
            };
            break;
          case "swapTargets":
            action = {
              name,
              target1: target,
              target2: { type: "implicit" },
            };
            break;
          case "callAsFunction":
            action = {
              name,
              callee: target,
              argument: { type: "implicit" },
            };
            break;
          case "pasteFromClipboard":
            action = {
              name,
              destination: {
                type: "primitive",
                insertionMode: "to",
                target,
              },
            };
            break;
          case "generateSnippet":
          case "highlight":
            action = {
              name,
              target,
            };
            break;
          default:
            action = {
              name: name as any,
              target,
            };
            break;
        }
        return { action, exitCursorlessMode };
      },
    );
  };

  /**
   * Performs action {@link name} on the current target
   * @param name The action to run
   * @returns A promise that resolves to the result of the cursorless command
   */
  performActionOnTarget = async (
    constructActionPayload: (target: PartialPrimitiveTargetDescriptor) => {
      action: ActionDescriptor;
      exitCursorlessMode: boolean;
    },
  ) => {
    const { action, exitCursorlessMode } = constructActionPayload({
      type: "primitive",
      mark: {
        type: "keyboard",
      },
    });
    const returnValue = await executeCursorlessCommand(action);

    if (exitCursorlessMode) {
      // For some Cursorless actions, it is more convenient if we automatically
      // exit modal mode
      await this.modal.modeOff();
    }

    return returnValue;
  };

  /**
   * Performs the given VSCode command on the current target. If
   * {@link keepChangedSelection} is true, then the selection will not be
   * restored after the command is run.
   *
   * @param commandId The command to run
   * @param options Additional options
   * @returns A promise that resolves to the result of the VSCode command
   */
  performVscodeCommandOnTarget = async (
    commandId: string,
    {
      args,
      keepChangedSelection,
      exitCursorlessMode,
    }: VscodeCommandOnTargetOptions = {},
  ) => {
    const target: PartialPrimitiveTargetDescriptor = {
      type: "primitive",
      mark: {
        type: "keyboard",
      },
    };

    const returnValue = await executeCursorlessCommand({
      name: "executeCommand",
      target,
      commandId,
      options: {
        restoreSelection: !keepChangedSelection,
        showDecorations: true,
        commandArgs: args,
      },
    });

    if (exitCursorlessMode) {
      // For some Cursorless actions, it is more convenient if we automatically
      // exit modal mode
      await this.modal.modeOff();
    }

    return returnValue;
  };

  /**
   * Sets the current target to the current selection
   * @returns A promise that resolves to the result of the cursorless command
   */
  targetSelection = () =>
    executeCursorlessCommand({
      name: "private.setKeyboardTarget",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    });

  /**
   * Unsets the current target, causing any highlights to disappear
   * FIXME: This is a hack relying on the fact that running any command
   * will clobber all special targets
   * @returns A promise that resolves to the result of the cursorless command
   */
  clearTarget = () =>
    executeCursorlessCommand({
      name: "setSelection",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
        modifiers: [{ type: "toRawSelection" }],
      },
    });
}

interface VscodeCommandOnTargetOptions {
  /** The arguments to pass to the command */
  args?: unknown[];

  /** If `true`, the selection will not be restored after the command is run */
  keepChangedSelection?: boolean;

  /** If `true`, exit Cursorless mode after running command */
  exitCursorlessMode?: boolean;
}

function executeCursorlessCommand(action: ActionDescriptor) {
  return runCursorlessCommand({
    action,
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
  });
}
