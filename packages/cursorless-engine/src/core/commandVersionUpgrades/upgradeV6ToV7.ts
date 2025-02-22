import type {
  ActionDescriptorV6,
  CommandV6,
  CommandV7,
  Modifier,
  ScopeTypeV6,
  SimpleScopeTypeType,
} from "@cursorless/common";
import { getPartialTargetDescriptors } from "../../util/getPartialTargetDescriptors";
import { transformPartialPrimitiveTargets } from "../../util/getPrimitiveTargets";

export function upgradeV6ToV7(command: CommandV6): CommandV7 {
  updateAction(command.action);
  return { ...command, version: 7 };
}

function updateAction(action: ActionDescriptorV6) {
  transformPartialPrimitiveTargets(
    getPartialTargetDescriptors(action),
    (target) => {
      return {
        ...target,
        modifiers: target.modifiers?.flatMap(upgradeModifier),
      };
    },
  );
}

const upgrades: Partial<Record<ScopeTypeV6["type"], SimpleScopeTypeType>> = {
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

    // case "modifyIfUntyped":
    //   return [
    //     {
    //       type: "modifyIfUntyped",
    //       // TODO: This is a hack
    //       // We should really use a new type of modifier that chains modifiers
    //       modifier: upgradeModifier(modifier.modifier)[0],
    //     },
    //   ];

    default:
      return [modifier];
  }
}
