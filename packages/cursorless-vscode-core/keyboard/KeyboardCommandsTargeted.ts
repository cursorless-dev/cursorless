import * as vscode from "vscode";
import type { ActionType } from "../../cursorless-engine/core/commandRunner/typings/ActionCommand";
import type {
  CommandLatest,
  LATEST_VERSION,
} from "../../cursorless-engine/core/commandRunner/typings/command.types";
import type {
  ImplicitTargetDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
  SimpleScopeTypeType,
} from "../../cursorless-engine/core/commandRunner/typings/PartialTargetDescriptor.types";
import type { runCursorlessCommand } from "../../cursorless-vscode-e2e/runCommand";
import type { getStyleName } from "../ide/vscode/hats/getStyleName";
import type { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import KeyboardCommandsModal from "./KeyboardCommandsModal";
import KeyboardHandler from "./KeyboardHandler";

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
  constructor(
    private keyboardHandler: KeyboardHandler,
    private modal: KeyboardCommandsModal,
  ) {
    this.targetDecoratedMark = this.targetDecoratedMark.bind(this);
    this.performActionOnTarget = this.performActionOnTarget.bind(this);
    this.targetScopeType = this.targetScopeType.bind(this);
    this.targetSelection = this.targetSelection.bind(this);
    this.clearTarget = this.clearTarget.bind(this);
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
      action: {
        name: "highlight",
      },
      targets: [target],
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
      action: {
        name: "highlight",
      },
      targets: [
        {
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
      ],
    });

  private highlightTarget = () =>
    executeCursorlessCommand({
      action: {
        name: "highlight",
      },
      targets: [
        {
          type: "primitive",
          mark: {
            type: "that",
          },
        },
      ],
    });

  /**
   * Performs action {@link action} on the current target
   * @param action The action to run
   * @returns A promise that resolves to the result of the cursorless command
   */
  performActionOnTarget = async (action: ActionType) => {
    const targets: (
      | PartialPrimitiveTargetDescriptor
      | ImplicitTargetDescriptor
    )[] = [
      {
        type: "primitive",
        mark: {
          type: "that",
        },
      },
    ];

    if (MULTIPLE_TARGET_ACTIONS.includes(action)) {
      // For multi-target actiosn (eg "bring"), we just use implicit destination
      targets.push({
        type: "implicit",
      });
    }

    const returnValue = await executeCursorlessCommand({
      action: {
        name: action,
      },
      targets,
    });

    await this.highlightTarget();

    if (EXIT_CURSORLESS_MODE_ACTIONS.includes(action)) {
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
      action: {
        name: "highlight",
      },
      targets: [
        {
          type: "primitive",
          mark: {
            type: "cursor",
          },
          modifiers: [{ type: "toRawSelection" }],
        },
      ],
    });

  /**
   * Unsets the current target, causing any highlights to disappear
   * @returns A promise that resolves to the result of the cursorless command
   */
  clearTarget = () =>
    executeCursorlessCommand({
      action: {
        name: "highlight",
      },
      targets: [
        {
          type: "primitive",
          mark: {
            type: "nothing",
          },
        },
      ],
    });
}

function executeCursorlessCommand(
  command: Omit<CommandLatest, "version" | "usePrePhraseSnapshot">,
) {
  return runCursorlessCommand({
    ...command,
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
  });
}

const MULTIPLE_TARGET_ACTIONS: ActionType[] = [
  "replaceWithTarget",
  "moveToTarget",
  "swapTargets",
];

const EXIT_CURSORLESS_MODE_ACTIONS: ActionType[] = [
  "setSelectionBefore",
  "setSelectionAfter",
  "editNewLineBefore",
  "editNewLineAfter",
  "clearAndSetSelection",
];
