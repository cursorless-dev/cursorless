import {
  ActionDescriptor,
  ActionType,
  Direction,
  LATEST_VERSION,
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
  SimpleScopeTypeType,
} from "@cursorless/common";
import { runCursorlessCommand } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import type { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import { getStyleName } from "../ide/vscode/hats/getStyleName";
import KeyboardCommandsModal from "./KeyboardCommandsModal";
import KeyboardHandler from "./KeyboardHandler";

type TargetingMode = "replace" | "extend" | "append";
type TargetModifierTypeArgument = "every" | "interiorOnly" | "excludeInterior";
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

interface TargetScopeTypeArgument {
  scopeType: SimpleScopeTypeType;
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
    this.targetScopeType = this.targetScopeType.bind(this);
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
      name: "highlight",
      target,
    });
  };

  /**
   * Expands the current target to the containing {@link scopeType}
   * @param param0 Describes the desired scope type
   * @returns A promise that resolves to the result of the cursorless command
   */
  targetScopeType = async ({
    scopeType,
    type = "containingScope",
  }: TargetScopeTypeArgument) =>
    await executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        modifiers: [
          {
            type,
            scopeType: {
              type: scopeType,
            },
          },
        ],
        mark: {
          type: "that",
        },
      },
    });

  
  targetModifierType = async (mod: TargetModifierTypeArgument) =>
    await executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        modifiers: [
          {
           type: "interiorOnly",
           
          },
        ],
        mark: {
          type: "that",
        },
      },
    });

  private highlightTarget = () =>
    executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        mark: {
          type: "that",
        },
      },
    });

  /**
   * Performs action {@link name} on the current target
   * @param name The action to run
   * @returns A promise that resolves to the result of the cursorless command
   */
  performActionOnTarget = async (name: ActionType) => {
    const target: PartialPrimitiveTargetDescriptor = {
      type: "primitive",
      mark: {
        type: "that",
      },
    };

    let returnValue: unknown;

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
        returnValue = await executeCursorlessCommand({
          name,
          source: target,
          destination: { type: "implicit" },
        });
        break;
      case "swapTargets":
        returnValue = await executeCursorlessCommand({
          name,
          target1: target,
          target2: { type: "implicit" },
        });
        break;
      case "callAsFunction":
        returnValue = await executeCursorlessCommand({
          name,
          callee: target,
          argument: { type: "implicit" },
        });
        break;
      case "pasteFromClipboard":
        returnValue = await executeCursorlessCommand({
          name,
          destination: {
            type: "primitive",
            insertionMode: "to",
            target,
          },
        });
        break;
      case "generateSnippet":
      case "highlight":
        returnValue = await executeCursorlessCommand({
          name,
          target,
        });
        break;
      default:
        returnValue = await executeCursorlessCommand({
          name,
          target,
        });
    }

    await this.highlightTarget();

    const EXIT_CURSORLESS_MODE_ACTIONS:string[]=vscode.workspace.getConfiguration("cursorless.experimental.keyboard.modal").get("exit_actions")??[];
    
    if (EXIT_CURSORLESS_MODE_ACTIONS.includes(name)) {
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
      name: "highlight",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    });

  expandTarget = (direction:Direction) =>

    executeCursorlessCommand({

      name: "highlight",
      target: {
        type: "range",
        anchor: {
          type: "primitive",
          mark: {
            type: "that",
          },
        },
        active: {
          type: "primitive",
          mark: {
            type: "that",
            
          },
          modifiers: [
            {
              type: "relativeScope",
              direction: direction,
              length: 1,
              offset: 1,
              scopeType: {
                type: "token",
              },            
              
            },

          ],
        },
        excludeActive: false,
        excludeAnchor: false,
        

        
      },
    });

  /**
   * Unsets the current target, causing any highlights to disappear
   * @returns A promise that resolves to the result of the cursorless command
   */
  clearTarget = () =>
    executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        mark: {
          type: "nothing",
        },
      },
    });
}

export function executeCursorlessCommand(action: ActionDescriptor) {
  return runCursorlessCommand({
    action,
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
  });
}





