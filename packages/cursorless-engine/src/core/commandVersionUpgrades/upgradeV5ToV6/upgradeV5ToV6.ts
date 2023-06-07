import {
  CommandV5,
  CommandV6,
  ImplicitTargetDescriptor,
  Modifier,
  ModifierV5,
  PartialPrimitiveTargetDescriptor,
  PartialPrimitiveTargetDescriptorV5,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
  PartialTargetDescriptorV5,
  ScopeTypeV5,
  SimpleScopeTypeType,
} from "@cursorless/common";

export function upgradeV5ToV6(command: CommandV5): CommandV6 {
  return {
    ...command,
    version: 6,
    targets: transformPartialPrimitiveTargets(command.targets, upgradeTarget),
  };
}

function upgradeTarget(
  target: PartialPrimitiveTargetDescriptorV5,
): PartialPrimitiveTargetDescriptor {
  return {
    ...target,
    modifiers: target.modifiers?.flatMap(upgradeModifier),
  };
}

const upgrades: Partial<Record<ScopeTypeV5["type"], SimpleScopeTypeType>> = {
  functionName: "namedFunction",
  className: "class",
};

function upgradeModifier(modifier: ModifierV5): Modifier[] {
  switch (modifier.type) {
    case "containingScope":
    case "everyScope":
    case "ordinalScope":
    case "relativeScope": {
      const upgradedScopeType = upgrades[modifier.scopeType.type];

      if (upgradedScopeType == null) {
        return [modifier];
      }

      return [
        {
          type: "containingScope",
          scopeType: {
            type: "name",
          },
        },
        {
          ...modifier,
          scopeType: {
            type: upgradedScopeType,
          },
        },
      ];
    }
    case "extendThroughStartOf":
    case "extendThroughEndOf":
      return [
        {
          type: modifier.type,
          modifiers: modifier.modifiers?.flatMap(upgradeModifier),
        },
      ];
    case "modifyIfUntyped":
      return [
        {
          type: "modifyIfUntyped",
          // TODO: This is a hack
          // We should really use a new type of modifier that chains modifiers
          modifier: upgradeModifier(modifier.modifier)[0],
        },
      ];
    default:
      return [modifier];
  }
}

/**
 * Given a list of targets, recursively descends all targets and applies `func`
 * to every primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */
function transformPartialPrimitiveTargets(
  targets: PartialTargetDescriptorV5[],
  func: (
    target: PartialPrimitiveTargetDescriptorV5,
  ) => PartialPrimitiveTargetDescriptor,
) {
  return targets.map((target) =>
    transformPartialPrimitiveTargetsHelper(target, func),
  );
}

function transformPartialPrimitiveTargetsHelper(
  target: PartialTargetDescriptorV5,
  func: (
    target: PartialPrimitiveTargetDescriptorV5,
  ) => PartialPrimitiveTargetDescriptor,
): PartialTargetDescriptor {
  switch (target.type) {
    case "primitive":
      return func(target);
    case "implicit":
      return target;
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (element) =>
            transformPartialPrimitiveTargetsHelper(element, func) as
              | PartialPrimitiveTargetDescriptor
              | PartialRangeTargetDescriptor,
        ),
      };
    case "range":
      return {
        ...target,
        anchor: transformPartialPrimitiveTargetsHelper(target.anchor, func) as
          | PartialPrimitiveTargetDescriptor
          | ImplicitTargetDescriptor,
        active: func(target.active),
      };
  }
}
