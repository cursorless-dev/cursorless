import {
  CommandV3,
  CommandV4,
  ImplicitTargetDescriptor,
  PartialPrimitiveTargetDescriptorV3,
  PartialPrimitiveTargetDescriptorV4,
  PartialRangeTargetDescriptorV4,
  PartialTargetDescriptorV3,
  PartialTargetDescriptorV4,
} from "@cursorless/common";

export function upgradeV3ToV4(command: CommandV3): CommandV4 {
  return {
    ...command,
    version: 4,
    targets: command.targets.map(upgradeTarget),
  };
}

function upgradeTarget(
  target: PartialTargetDescriptorV3,
): PartialTargetDescriptorV4 {
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
          | PartialPrimitiveTargetDescriptorV4
          | PartialRangeTargetDescriptorV4
        )[],
      };
    }
  }
}

function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetDescriptorV3,
): PartialPrimitiveTargetDescriptorV4 | ImplicitTargetDescriptor {
  if ((target.mark == null && target.modifiers == null) || target.isImplicit) {
    return { type: "implicit" };
  }

  return target;
}
