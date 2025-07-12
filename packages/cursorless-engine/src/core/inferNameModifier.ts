import type {
  Modifier,
  ScopeType,
  SimpleScopeTypeType,
} from "@cursorless/common";

/**
 * Replace scope type `functionName` with  containing `name` and `namedFunction`.
 * * Replace scope type `className` with containing `name` and `class`.
 */

export function inferNameModifier(modifiers: Modifier[]): Modifier[] {
  return modifiers.flatMap(updateModifier);
}

const mappings: Partial<Record<ScopeType["type"], SimpleScopeTypeType>> = {
  functionName: "namedFunction",
  className: "class",
};

function updateModifier(modifier: Modifier): Modifier[] {
  switch (modifier.type) {
    case "containingScope":
    case "everyScope":
    case "ordinalScope":
    case "relativeScope": {
      const upgradedScopeType = mappings[modifier.scopeType.type];

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
          modifiers: modifier.modifiers?.flatMap(updateModifier),
        },
      ];

    case "modifyIfUntyped":
      throw Error("Unexpected modifier type: modifyIfUntyped");

    default:
      return [modifier];
  }
}
