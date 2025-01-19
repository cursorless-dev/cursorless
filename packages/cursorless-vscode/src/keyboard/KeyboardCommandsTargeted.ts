import type {
  ActionDescriptor,
  Modifier,
  PartialMark,
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
  ScopeType,
} from "@cursorless/common";
import { LATEST_VERSION } from "@cursorless/common";
import { runCursorlessCommand } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import type { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import { getStyleName } from "../ide/vscode/hats/getStyleName";
import type KeyboardCommandsModal from "./KeyboardCommandsModal";
import type KeyboardHandler from "./KeyboardHandler";
import type { SimpleKeyboardActionDescriptor } from "./KeyboardActionType";

export type TargetingMode =
  | "replace"
  | "makeRange"
  | "makeVerticalRange"
  | "makeList";

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

interface PerformActionOpts {
  exitCursorlessMode: boolean;
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

    return await setKeyboardTarget(
      this.applyTargetingMode(
        {
          type: "primitive",
          mark: {
            type: "decoratedSymbol",
            symbolColor: getStyleName(color, shape),
            character,
          },
        },
        mode,
      ),
    );
  };

  private applyTargetingMode(
    target: PartialPrimitiveTargetDescriptor,
    mode: TargetingMode,
  ): PartialTargetDescriptor {
    switch (mode) {
      case "makeRange":
        return {
          type: "range",
          anchor: getKeyboardTarget(),
          active: target,
          excludeActive: false,
          excludeAnchor: false,
        };
      case "makeVerticalRange":
        return {
          type: "range",
          anchor: getKeyboardTarget(),
          active: target,
          excludeActive: false,
          excludeAnchor: false,
          rangeType: "vertical",
        };
      case "makeList":
        return {
          type: "list",
          elements: [getKeyboardTarget(), target],
        };
      case "replace":
        return target;
    }
  }

  /**
   * Sets the highlighted target to the given mark
   *
   * @param mark The desired mark
   * @param mode The targeting mode
   * @returns A promise that resolves to the result of the cursorless command
   */
  targetMark = async (mark: PartialMark, mode: TargetingMode = "replace") =>
    await setKeyboardTarget(
      this.applyTargetingMode({ type: "primitive", mark }, mode),
    );

  /**
   * Applies {@link modifier} to the current target
   * @param param0 Describes the desired modifier
   * @returns A promise that resolves to the result of the cursorless command
   */
  targetModifier = async (
    modifier: Modifier,
    mode: TargetingMode = "replace",
  ) =>
    await setKeyboardTarget(
      this.applyTargetingMode(getKeyboardTarget(modifier), mode),
    );

  /**
   * Expands the current target to the containing {@link scopeType}
   * @param param0 Describes the desired scope type
   * @returns A promise that resolves to the result of the cursorless command
   */
  modifyTargetContainingScope = async ({
    scopeType,
    type = "containingScope",
  }: ModifyTargetContainingScopeArgument) =>
    await this.targetModifier({
      type,
      scopeType,
    });

  /**
   * Performs action {@link name} on the current target
   * @param name The action to run
   * @returns A promise that resolves to the result of the cursorless command
   */
  performSimpleActionOnTarget = async ({
    actionId: name,
    exitCursorlessMode,
  }: SimpleKeyboardActionDescriptor) => {
    return this.performActionOnTarget(
      (target) => {
        switch (name) {
          case "rewrapWithPairedDelimiter":
          case "insertSnippet":
          case "executeCommand":
          case "replace":
          case "editNew":
          case "getText":
          case "parsed":
          case "generateSnippet":
            throw Error(`Unsupported keyboard action: ${name}`);
          case "replaceWithTarget":
          case "moveToTarget":
            return {
              name,
              source: target,
              destination: { type: "implicit" },
            };
          case "swapTargets":
            return {
              name,
              target1: target,
              target2: { type: "implicit" },
            };
          case "callAsFunction":
            return {
              name,
              callee: target,
              argument: { type: "implicit" },
            };
          case "pasteFromClipboard":
            return {
              name,
              destination: {
                type: "primitive",
                insertionMode: "to",
                target,
              },
            };
          case "highlight":
            return {
              name,
              target,
            };
          default:
            return {
              name,
              target,
            };
        }
      },
      { exitCursorlessMode },
    );
  };

  /**
   * Performs action {@link name} on the current target
   * @param name The action to run
   * @returns A promise that resolves to the result of the cursorless command
   */
  performActionOnTarget = async (
    constructActionPayload: (
      target: PartialPrimitiveTargetDescriptor,
    ) => ActionDescriptor,
    { exitCursorlessMode }: PerformActionOpts,
  ) => {
    const action = constructActionPayload(getKeyboardTarget());
    const returnValue = await executeCursorlessCommand(action);

    if (exitCursorlessMode) {
      // For some Cursorless actions, it is more convenient if we automatically
      // exit modal mode
      await this.modal.modeOff();
    } else {
      // If we're not exiting cursorless mode, preserve the keyboard mark
      // FIXME: Better to just not clobber the keyboard mark on each action?
      await this.targetSelection();
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
    const returnValue = await executeCursorlessCommand({
      name: "executeCommand",
      target: getKeyboardTarget(),
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
    setKeyboardTarget({
      type: "primitive",
      mark: {
        type: "cursor",
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

function setKeyboardTarget(target: PartialTargetDescriptor) {
  return executeCursorlessCommand({
    name: "private.setKeyboardTarget",
    target,
  });
}

function getKeyboardTarget(
  ...modifiers: Modifier[]
): PartialPrimitiveTargetDescriptor {
  return {
    type: "primitive",
    modifiers: modifiers.length > 0 ? modifiers : undefined,
    mark: {
      type: "keyboard",
    },
  };
}

function executeCursorlessCommand(action: ActionDescriptor) {
  return runCursorlessCommand({
    action,
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
  });
}
