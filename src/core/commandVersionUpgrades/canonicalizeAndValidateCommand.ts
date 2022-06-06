import { commands } from "vscode";
import { ActionableError } from "../../errors";
import {
  Modifier,
  PartialTargetDescriptor,
  SimpleScopeTypeType,
} from "../../typings/targetDescriptor.types";
import { ActionType } from "../../actions/actions.types";
import { getPartialPrimitiveTargets } from "../../util/getPrimitiveTargets";
import {
  Command,
  CommandComplete,
  CommandLatest,
  LATEST_VERSION,
} from "../commandRunner/command.types";
import canonicalizeActionName from "./canonicalizeActionName";
import canonicalizeTargets from "./canonicalizeTargets";
import { upgradeV0ToV1 } from "./upgradeV0ToV1";
import { upgradeV1ToV2 } from "./upgradeV1ToV2";

/**
 * Given a command argument which comes from the client, normalize it so that it
 * conforms to the latest version of the expected cursorless command argument.
 *
 * @param command The command argument to normalize
 * @returns The normalized command argument
 */
export function canonicalizeAndValidateCommand(
  command: Command
): CommandComplete {
  const commandUpgraded = upgradeCommand(command);
  const {
    action,
    targets: inputPartialTargets,
    usePrePhraseSnapshot = false,
    version,
    ...rest
  } = commandUpgraded;

  const actionName = canonicalizeActionName(action.name);
  const partialTargets = canonicalizeTargets(inputPartialTargets);

  validateCommand(actionName, partialTargets);

  return {
    ...rest,
    version: LATEST_VERSION,
    action: {
      name: actionName,
      args: action.args ?? [],
    },
    targets: partialTargets,
    usePrePhraseSnapshot,
  };
}

function upgradeCommand(command: Command): CommandLatest {
  if (command.version > LATEST_VERSION) {
    throw new ActionableError(
      "Cursorless Talon version is ahead of Cursorless VSCode extension version. Please update Cursorless VSCode.",
      [
        {
          name: "Check for updates",
          action: () =>
            commands.executeCommand(
              "workbench.extensions.action.checkForUpdates"
            ),
        },
      ]
    );
  }

  while (command.version < LATEST_VERSION) {
    switch (command.version) {
      case 0:
        command = upgradeV0ToV1(command);
        break;
      case 1:
        command = upgradeV1ToV2(command);
        break;
      default:
        throw new Error(
          `Can't upgrade from unknown version ${command.version}`
        );
    }
  }

  if (command.version !== LATEST_VERSION) {
    throw new Error("Command is not latest version");
  }

  return command;
}

export function validateCommand(
  actionName: ActionType,
  partialTargets: PartialTargetDescriptor[]
) {
  if (
    usesScopeType("notebookCell", partialTargets) &&
    !["editNewLineBefore", "editNewLineAfter"].includes(actionName)
  ) {
    throw new Error(
      "The notebookCell scope type is currently only supported with the actions editNewLineAbove and editNewLineBelow"
    );
  }
}

function usesScopeType(
  scopeTypeType: SimpleScopeTypeType,
  partialTargets: PartialTargetDescriptor[]
) {
  return getPartialPrimitiveTargets(partialTargets).some((partialTarget) =>
    partialTarget.modifiers?.find(
      (mod: Modifier) =>
        (mod.type === "containingScope" || mod.type === "everyScope") &&
        mod.scopeType.type === scopeTypeType
    )
  );
}
