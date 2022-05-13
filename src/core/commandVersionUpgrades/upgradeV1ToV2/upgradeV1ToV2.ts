import { flow } from "lodash";
import { transformPartialPrimitiveTargets } from "../../../util/getPrimitiveTargets";
import { CommandV0, CommandV1 } from "../../commandRunner/command.types";
import { upgradeStrictHere } from "./upgradeStrictHere";

export function upgradeV1ToV2(command: CommandV1): CommandV2 {
  return {
    ...command,
    targets: upgradeTargets(command.targets),
    version: 2,
  };
}

function upgradeTargets(partialTargets: PartialTarget[]) {
  return transformPartialPrimitiveTargets(
    partialTargets,
    flow(upgradeStrictHere)
  );
}
