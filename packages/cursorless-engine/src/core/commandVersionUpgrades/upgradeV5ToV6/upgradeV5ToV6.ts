import {
  CommandV5,
  CommandV6,
  ImplicitTargetDescriptor,
  InsertionMode,
  Modifier,
  ModifierV5,
  PartialPrimitiveTargetDescriptor,
  PartialPrimitiveTargetDescriptorV5,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
  PartialTargetDescriptorV5,
  PositionModifierV5,
} from "@cursorless/common";

export function upgradeV5ToV6(command: CommandV5): CommandV6 {
  return {
    ...command,
    version: 6,
    targets: command.targets.map(updateTarget),
  };
}

function updateTarget(
  target: PartialTargetDescriptorV5,
): PartialTargetDescriptor {
  switch (target.type) {
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (target) =>
            updateTarget(target) as
              | PartialPrimitiveTargetDescriptor
              | PartialRangeTargetDescriptor,
        ),
      };
    case "range": {
      const { anchor, active, ...rest } = target;
      return {
        ...rest,
        anchor: updateTarget(anchor) as
          | PartialPrimitiveTargetDescriptor
          | ImplicitTargetDescriptor,
        active: updateTarget(active) as PartialPrimitiveTargetDescriptor,
      };
    }
    case "primitive":
      return upgradePrimitiveTarget(target);
    case "implicit":
      return target;
  }
}

function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetDescriptorV5,
): PartialPrimitiveTargetDescriptor {
  return {
    ...target,
    destination: getDestination(target.modifiers),
    modifiers: getModifiers(target.modifiers),
  };
}

function getDestination(modifiers?: ModifierV5[]): InsertionMode | undefined {
  const positionModifier = modifiers?.find(
    (m): m is PositionModifierV5 => m.type === "position",
  );
  return positionModifier?.position === "before" ||
    positionModifier?.position === "after"
    ? positionModifier.position
    : undefined;
}

function getModifiers(modifiers?: ModifierV5[]): Modifier[] | undefined {
  return modifiers
    ? modifiers.filter(
        (m): m is Modifier =>
          m.type !== "position" ||
          (m.position !== "before" && m.position !== "after"),
      )
    : undefined;
}
