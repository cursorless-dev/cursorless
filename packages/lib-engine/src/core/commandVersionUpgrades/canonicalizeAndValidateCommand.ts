import { produce } from "immer";
import type {
  ActionType,
  Command,
  CommandComplete,
  CommandVersion,
  EnforceUndefined,
  PartialTargetDescriptor,
} from "@cursorless/lib-common";
import { LATEST_VERSION, OutdatedExtensionError } from "@cursorless/lib-common";
import { getPartialTargetDescriptors } from "../../util/getPartialTargetDescriptors";
import { canonicalizeTargetsInPlace } from "./canonicalizeTargetsInPlace";
import { upgradeV0ToV1 } from "./upgradeV0ToV1";
import { upgradeV1ToV2 } from "./upgradeV1ToV2";
import { upgradeV2ToV3 } from "./upgradeV2ToV3";
import { upgradeV3ToV4 } from "./upgradeV3ToV4";
import { upgradeV4ToV5 } from "./upgradeV4ToV5/upgradeV4ToV5";
import { upgradeV5ToV6 } from "./upgradeV5ToV6";
import { upgradeV6ToV7 } from "./upgradeV6ToV7";

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
  const commandUpgraded = upgradeCommand(command, LATEST_VERSION);
  const { action, usePrePhraseSnapshot = false, spokenForm } = commandUpgraded;

  return {
    version: LATEST_VERSION,
    spokenForm,
    action: produce(action, (draft) => {
      const partialTargets = getPartialTargetDescriptors(draft);

      canonicalizeTargetsInPlace(partialTargets);
      validateCommand(action.name, partialTargets);
    }),
    usePrePhraseSnapshot,
  };
}

export function upgradeCommand<V extends CommandVersion>(
  command: Command,
  minimumVersion: V,
): Command & { version: V } {
  let upgradedCommand = command;

  if (upgradedCommand.version > LATEST_VERSION) {
    throw new OutdatedExtensionError();
  }

  while (upgradedCommand.version < minimumVersion) {
    switch (upgradedCommand.version) {
      case 0:
        upgradedCommand = upgradeV0ToV1(upgradedCommand);
        break;
      case 1:
        upgradedCommand = upgradeV1ToV2(upgradedCommand);
        break;
      case 2:
        upgradedCommand = upgradeV2ToV3(upgradedCommand);
        break;
      case 3:
        upgradedCommand = upgradeV3ToV4(upgradedCommand);
        break;
      case 4:
        upgradedCommand = upgradeV4ToV5(upgradedCommand);
        break;
      case 5:
        upgradedCommand = upgradeV5ToV6(upgradedCommand);
        break;
      case 6:
        upgradedCommand = upgradeV6ToV7(upgradedCommand);
        break;
      default:
        throw new Error(
          `Can't upgrade from unknown version ${upgradedCommand.version}`,
        );
    }
  }

  return upgradedCommand as Command & {
    version: V;
  };
}

/**
 * Validates the given action. Today, this function is a no-op, but in the
 * future it may perform additional validation.
 *
 * @param _actionName The name of the action
 * @param _partialTargets The partial targets of the action
 */
function validateCommand(
  _actionName: ActionType,
  _partialTargets: PartialTargetDescriptor[],
): void {
  // No-op for now
}
