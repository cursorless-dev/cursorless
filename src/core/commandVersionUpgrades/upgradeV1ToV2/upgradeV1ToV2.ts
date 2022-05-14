import { flow } from "lodash";
import { PartialTarget } from "../../../typings/target.types";
import { ActionType } from "../../../typings/Types";
import { transformPartialPrimitiveTargets } from "../../../util/getPrimitiveTargets";
import { CommandV2 } from "../../commandRunner/command.types";
import { CommandV1, PartialTargetV0V1 } from "./commandV1.types";
import { upgradeStrictHere } from "./upgradeStrictHere";

export function upgradeV1ToV2(command: CommandV1): CommandV2 {
  return {
    spokenForm: command.spokenForm,
    action: command.action as ActionType,
    targets: upgradeTargets(command.targets),
    extraArgs: command.extraArgs,
    usePrePhraseSnapshot: command.usePrePhraseSnapshot ?? false,
    version: 2,
  };
}

function upgradeTargets(partialTargets: PartialTargetV0V1[]) {
  // const partialTargetsV2: PartialTarget[] = partialTargets.map(
  //   (target) => ({

  //   })
  // );
  // TODO do target migration
  const partialTargetsV2: PartialTarget[] = [];
  return transformPartialPrimitiveTargets(
    partialTargetsV2,
    flow(upgradeStrictHere)
  );
}
