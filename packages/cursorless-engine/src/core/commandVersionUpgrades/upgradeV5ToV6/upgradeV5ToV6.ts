import {
  ActionTypeV5,
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
    targets: upgradeTargets(command.targets, command.action.name),
  };
}

function upgradeTargets(
  targets: PartialTargetDescriptorV5[],
  action: ActionTypeV5,
): PartialTargetDescriptor[] {
  switch (action) {
    case "pasteFromClipboard":
      return [upgradeTarget(targets[0], true)];
    case "replaceWithTarget":
    case "moveToTarget":
      return [
        upgradeTarget(targets[0], false),
        upgradeTarget(targets[1], true),
      ];
  }

  return targets.map((t) => upgradeTarget(t, false));
}

function upgradeTarget(
  target: PartialTargetDescriptorV5,
  isDestination: boolean,
): PartialTargetDescriptor {
  switch (target.type) {
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (target, i) =>
            upgradeTarget(target, isDestination && i === 0) as
              | PartialPrimitiveTargetDescriptor
              | PartialRangeTargetDescriptor,
        ),
      };
    case "range": {
      const { anchor, active, ...rest } = target;
      return {
        ...rest,
        anchor: upgradeTarget(anchor, isDestination) as
          | PartialPrimitiveTargetDescriptor
          | ImplicitTargetDescriptor,
        active: upgradeTarget(
          active,
          false,
        ) as PartialPrimitiveTargetDescriptor,
      };
    }
    case "primitive":
      return upgradePrimitiveTarget(target, isDestination);
    case "implicit":
      return target;
  }
}

function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetDescriptorV5,
  isDestination: boolean,
): PartialPrimitiveTargetDescriptor {
  return {
    ...target,
    destination: getDestination(target.modifiers, isDestination),
    modifiers: getModifiers(target.modifiers),
  };
}

function getDestination(
  modifiers: ModifierV5[] | undefined,
  isDestination: boolean,
): InsertionMode | undefined {
  const positionModifier = modifiers?.find(
    (m): m is PositionModifierV5 => m.type === "position",
  );
  if (positionModifier != null) {
    if (modifiers!.indexOf(positionModifier) !== 0) {
      throw Error("Position modifier has to be at first index");
    }
    if (
      positionModifier?.position === "before" ||
      positionModifier?.position === "after"
    ) {
      return positionModifier.position;
    }
  }
  return isDestination ? "to" : undefined;
}

function getModifiers(modifiers?: ModifierV5[]): Modifier[] | undefined {
  return modifiers
    ? (modifiers.filter(
        (m) =>
          m.type !== "position" ||
          (m.position !== "before" && m.position !== "after"),
      ) as Modifier[])
    : undefined;
}
