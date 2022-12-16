import { CommandV4 } from "../../commandRunner/typings/CommandV4.types";
import { CommandV3 } from "../../commandRunner/typings/legacy/CommandV3.types";
import {
  PartialPrimitiveTargetDescriptorV3,
  PartialTargetDescriptorV3,
} from "../../commandRunner/typings/legacy/PartialTargetDescriptorV3.types";
import {
  ImplicitTargetDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
} from "../../commandRunner/typings/PartialTargetDescriptor.types";

export function upgradeV3ToV4(command: CommandV3): CommandV4 {
  return {
    ...command,
    version: 4,
    targets: command.targets.map(upgradeTarget),
  };
}

function upgradeTarget(
  target: PartialTargetDescriptorV3,
): PartialTargetDescriptor {
  switch (target.type) {
    case "primitive":
      return upgradePrimitiveTarget(target);
    case "range": {
      const { anchor, ...rest } = target;
      return {
        anchor: upgradePrimitiveTarget(anchor),
        ...rest,
      };
    }
    default:
      return target;
  }
}

function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetDescriptorV3,
): PartialPrimitiveTargetDescriptor | ImplicitTargetDescriptor {
  if ((target.mark == null && target.modifiers == null) || target.isImplicit) {
    return { type: "implicit" };
  }

  return target;
}
