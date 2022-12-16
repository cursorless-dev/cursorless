import { CommandV4 } from "../../commandRunner/typings/CommandV4.types";
import { CommandV3 } from "../../commandRunner/typings/legacy/CommandV3.types";
import {
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
  target: PartialTargetDescriptor,
): PartialTargetDescriptor {
  switch (target.type) {
    case "range": {
      const { anchor, ...rest } = target;
      return {
        anchor: upgradeAnchor(anchor),
        ...rest,
      };
    }
    default:
      return target;
  }
}

function upgradeAnchor(
  target: PartialPrimitiveTargetDescriptor,
): PartialPrimitiveTargetDescriptor {
  if (
    target.mark == null &&
    target.modifiers == null &&
    target.isImplicit == null
  ) {
    return { ...target, isImplicit: true };
  }

  return target;
}
