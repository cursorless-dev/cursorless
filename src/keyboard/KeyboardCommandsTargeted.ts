import * as vscode from "vscode";
import { ActionType } from "../actions/actions.types";
import {
  CommandLatest,
  LATEST_VERSION,
} from "../core/commandRunner/command.types";
import { getStyleName, HatColor, HatShape } from "../core/hatStyles";
import {
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
  SimpleScopeTypeType,
} from "../typings/targetDescriptor.types";
import { Graph } from "../typings/Types";

interface TargetDecoratedMarkArgument {
  color?: HatColor;
  shape?: HatShape;
  append?: boolean;
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
  constructor(private graph: Graph) {
    this.targetDecoratedMark = this.targetDecoratedMark.bind(this);
    this.performActionOnTarget = this.performActionOnTarget.bind(this);
    this.targetScopeType = this.targetScopeType.bind(this);
    this.targetSelection = this.targetSelection.bind(this);
    this.clearTarget = this.clearTarget.bind(this);
  }

  init() {
    this.graph.extensionContext.subscriptions.push(
      vscode.commands.registerCommand(
        "cursorless.keyboard.targeted.targetHat",
        this.targetDecoratedMark
      ),
      vscode.commands.registerCommand(
        "cursorless.keyboard.targeted.targetScope",
        this.targetScopeType
      ),
      vscode.commands.registerCommand(
        "cursorless.keyboard.targeted.targetSelection",
        this.targetSelection
      ),
      vscode.commands.registerCommand(
        "cursorless.keyboard.targeted.clearTarget",
        this.clearTarget
      ),
      vscode.commands.registerCommand(
        "cursorless.keyboard.targeted.runActionOnTarget",
        this.performActionOnTarget
      )
    );
  }

  targetDecoratedMark = async ({
    color = "default",
    shape = "default",
    append = false,
  }: TargetDecoratedMarkArgument) => {
    const character =
      await this.graph.keyboardCommands.keyboardHandler.awaitSingleKeypress();

    let target: PartialTargetDescriptor = {
      type: "primitive",
      mark: {
        type: "decoratedSymbol",
        symbolColor: getStyleName(color, shape),
        character,
      },
    };

    if (append) {
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
    }

    return executeCursorlessCommand({
      action: {
        name: "highlight",
      },
      targets: [target],
    });
  };

  targetScopeType = ({
    scopeType,
    type = "containingScope",
  }: TargetScopeTypeArgument) =>
    executeCursorlessCommand({
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

  performActionOnTarget = (action: ActionType) => {
    const targets: PartialPrimitiveTargetDescriptor[] = [
      {
        type: "primitive",
        mark: {
          type: "that",
        },
      },
    ];

    if (MULTIPLE_TARGET_ACTIONS.includes(action)) {
      targets.push({
        type: "primitive",
        mark: {
          type: "cursor",
        },
      });
    }

    return executeCursorlessCommand({
      action: {
        name: action,
      },
      targets,
    });
  };

  targetSelection = () =>
    executeCursorlessCommand({
      action: {
        name: "setSelection",
      },
      targets: [
        {
          type: "primitive",
          mark: {
            type: "cursor",
          },
        },
      ],
    });

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
  command: Omit<CommandLatest, "version" | "usePrePhraseSnapshot">
) {
  return vscode.commands.executeCommand("cursorless.command", {
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
