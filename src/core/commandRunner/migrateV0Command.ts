import { ActionType } from "../../actions/actions.types";
import { isString } from "../../util/type";
import { PartialTargetV0V1 } from "../commandVersionUpgrades/upgradeV1ToV2/commandV1.types";
import { Command } from "./command.types";

export default function migrateV0Command(args: unknown[]) {
  const [spokenFormOrCommand, ...rest] = args as [
    string | Command,
    ...unknown[],
  ];
  let command: Command;

  if (isString(spokenFormOrCommand)) {
    const spokenForm = spokenFormOrCommand;
    const [action, targets, ...extraArgs] = rest as [
      ActionType,
      PartialTargetV0V1[],
      ...unknown[],
    ];

    command = {
      version: 0,
      spokenForm,
      action,
      targets,
      extraArgs,
      usePrePhraseSnapshot: false,
    };
  } else {
    command = spokenFormOrCommand;
  }

  return command;
}
