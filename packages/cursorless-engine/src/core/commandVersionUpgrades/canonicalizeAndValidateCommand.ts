import {
  ActionType,
  Command,
  CommandComplete,
  CommandLatest,
  EnforceUndefined,
  LATEST_VERSION,
  Modifier,
  OutdatedExtensionError,
  PartialTargetDescriptor,
  showWarning,
  SimpleScopeTypeType,
} from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";
import { getPartialPrimitiveTargets } from "../../util/getPrimitiveTargets";
import canonicalizeActionName from "./canonicalizeActionName";
import canonicalizeTargets from "./canonicalizeTargets";
import { upgradeV0ToV1 } from "./upgradeV0ToV1";
import { upgradeV1ToV2 } from "./upgradeV1ToV2";
import { upgradeV2ToV3 } from "./upgradeV2ToV3";
import { upgradeV3ToV4 } from "./upgradeV3ToV4";
import { upgradeV4ToV5 } from "./upgradeV4ToV5/upgradeV4ToV5";
import { upgradeV5ToV6 } from "./upgradeV5ToV6";

/**
 * Given a command argument which comes from the client, normalize it so that it
 * conforms to the latest version of the expected cursorless command argument.
 *
 * @param command The command argument to normalize
 * @returns The normalized command argument
 */
export function canonicalizeAndValidateCommand(
  command: Command,
): EnforceUndefined<CommandComplete> {
  const commandUpgraded = upgradeCommand(command);
  const {
    action,
    targets: inputPartialTargets,
    usePrePhraseSnapshot = false,
    spokenForm,
  } = commandUpgraded;

  const actionName = canonicalizeActionName(action.name);
  const partialTargets = canonicalizeTargets(inputPartialTargets);

  validateCommand(actionName, partialTargets);

  return {
    version: LATEST_VERSION,
    spokenForm,
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
    throw new OutdatedExtensionError();
  }

  while (command.version < LATEST_VERSION) {
    switch (command.version) {
      case 0:
        command = upgradeV0ToV1(command);
        break;
      case 1:
        command = upgradeV1ToV2(command);
        break;
      case 2:
        command = upgradeV2ToV3(command);
        break;
      case 3:
        command = upgradeV3ToV4(command);
        break;
      case 4:
        command = upgradeV4ToV5(command);
        break;
      case 5:
        command = upgradeV5ToV6(command);
        break;
      default:
        throw new Error(
          `Can't upgrade from unknown version ${command.version}`,
        );
    }
  }

  if (command.version !== LATEST_VERSION) {
    throw new Error("Command is not latest version");
  }

  return command;
}

function validateCommand(
  actionName: ActionType,
  partialTargets: PartialTargetDescriptor[],
) {
  if (
    usesScopeType("notebookCell", partialTargets) &&
    !["editNewLineBefore", "editNewLineAfter"].includes(actionName)
  ) {
    throw new Error(
      "The notebookCell scope type is currently only supported with the actions editNewLineAbove and editNewLineBelow",
    );
  }
}

function usesScopeType(
  scopeTypeType: SimpleScopeTypeType,
  partialTargets: PartialTargetDescriptor[],
) {
  return getPartialPrimitiveTargets(partialTargets).some((partialTarget) =>
    partialTarget.modifiers?.find(
      (mod: Modifier) =>
        (mod.type === "containingScope" || mod.type === "everyScope") &&
        mod.scopeType.type === scopeTypeType,
    ),
  );
}

export function checkForOldInference(
  partialTargets: PartialTargetDescriptor[],
) {
  const hasOldInference = partialTargets.some((target) => {
    return (
      target.type === "range" &&
      target.active.mark == null &&
      target.active.modifiers?.some((m) => m.type === "position") &&
      !target.active.modifiers?.some((m) => m.type === "inferPreviousMark")
    );
  });

  if (hasOldInference) {
    const { globalState, messages } = ide();
    const hideInferenceWarning = globalState.get("hideInferenceWarning");

    if (!hideInferenceWarning) {
      showWarning(
        messages,
        "deprecatedPositionInference",
        'The "past start of" / "past end of" form has changed behavior.  For the old behavior, update cursorless-talon (https://www.cursorless.org/docs/user/updating/), and then you can now say "past start of its" / "past end of its". For example, "take air past end of its line".  You may also consider using "head" / "tail" instead; see https://www.cursorless.org/docs/#head-and-tail',
        "Don't show again",
      ).then((pressed) => {
        if (pressed) {
          globalState.set("hideInferenceWarning", true);
        }
      });
    }
  }
}
