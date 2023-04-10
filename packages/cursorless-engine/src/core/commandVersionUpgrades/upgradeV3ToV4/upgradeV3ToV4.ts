import {
  CommandV3,
  CommandV4,
  ImplicitTargetDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialPrimitiveTargetDescriptorV3,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
  PartialTargetDescriptorV3,
} from "@cursorless/common";

export function upgradeV3ToV4(command: CommandV3): CommandV4 {
  return {
    ...command,
    version: 4,
    targets: command.targets.map(upgradeTarget),
  };
}

function upgradeTarget(target: PartialTargetDescriptorV3): PartialTargetDescriptor {
  switch (target.type) {
    case "primitive":
      return upgradePrimitiveTarget(target);
    case "range": {
      const { anchor, ...rest } = target;
      return {
        ...rest,
        anchor: upgradePrimitiveTarget(anchor),
      };
    }
    case "list": {
      const { elements, ...rest } = target;

      return {
        ...rest,
        elements: elements.map(upgradeTarget) as (
          | PartialPrimitiveTargetDescriptor
          | PartialRangeTargetDescriptor
        )[],
      };
    }
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
