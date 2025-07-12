import type {
  CommandV7,
  CommandV8,
  Modifier,
  PartialPrimitiveTargetDescriptor,
  ScopeType,
  SimpleScopeTypeType,
} from "@cursorless/common";
import { getPartialTargetDescriptors } from "../../util/getPartialTargetDescriptors";
import { getPartialPrimitiveTargets } from "../../util/getPrimitiveTargets";

export function upgradeV7ToV8(command: CommandV7): CommandV8 {
  const targets = getPartialTargetDescriptors(command.action);
  const primitiveTargets = getPartialPrimitiveTargets(targets);
  primitiveTargets.forEach(upgradePrimitiveTarget);

  return { ...command, version: 8 };
}

export function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetDescriptor,
) {
  if (target.modifiers == null) {
    return;
  }
  target.modifiers = target.modifiers.flatMap(upgradeModifier);
}

const upgrades: Partial<Record<ScopeType["type"], SimpleScopeTypeType>> = {
  functionName: "namedFunction",
  className: "class",
};

function upgradeModifier(modifier: Modifier): Modifier[] {
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
