import type { ActionType, ActionTypeV2 } from "@cursorless/common";
import type { CommandV2 } from "@cursorless/common";
import type {
  ModifierV2,
  PartialPrimitiveTargetDescriptorV2,
  PartialRangeTargetDescriptorV2,
  PartialTargetDescriptorV2,
  SimpleScopeTypeTypeV2,
} from "@cursorless/common";
import type {
  CommandV1,
  ModifierV0V1,
  PartialPrimitiveTargetV0V1,
  PartialTargetV0V1,
} from "@cursorless/common";
import { upgradeStrictHere } from "./upgradeStrictHere";

export function upgradeV1ToV2(command: CommandV1): CommandV2 {
  const actionName = command.action as ActionTypeV2;
  return {
    spokenForm: command.spokenForm,
    action: {
      name: actionName,
      args: command.extraArgs,
    },
    targets: upgradeTargets(command.targets, actionName),
    usePrePhraseSnapshot: command.usePrePhraseSnapshot ?? false,
    version: 2,
  };
}

function upgradeModifier(modifier: ModifierV0V1): ModifierV2[] {
  switch (modifier.type) {
    case "identity":
      return [];

    case "containingScope": {
      const { includeSiblings, scopeType, type, ...rest } = modifier;

      return [
        {
          type: includeSiblings ? "everyScope" : "containingScope",
          scopeType: {
            type: scopeType as SimpleScopeTypeTypeV2,
          },
          ...rest,
        },
      ];
    }

    case "surroundingPair": {
      const { delimiterInclusion, ...rest } = modifier;
      const surroundingPairModifier = {
        type: "containingScope",
        scopeType: rest,
      } as const;

      if (
        delimiterInclusion === "interiorOnly" ||
        delimiterInclusion === "excludeInterior"
      ) {
        if (surroundingPairModifier.scopeType.delimiter === "any") {
          return [{ type: delimiterInclusion }];
        }
        return [{ type: delimiterInclusion }, surroundingPairModifier];
      }

      return [surroundingPairModifier];
    }

    case "subpiece": {
      const { type, pieceType, ...rest } = modifier;

      return [
        {
          type: "ordinalRange",
          scopeType: { type: pieceType },
          ...rest,
        },
      ];
    }

    case "head":
      return [{ type: "extendThroughStartOf" }];
    case "tail":
      return [{ type: "extendThroughEndOf" }];

    default:
      return [modifier];
  }
}

function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetV0V1,
  action: ActionType,
): PartialPrimitiveTargetDescriptorV2 {
  const {
    type,
    isImplicit,
    mark,
    insideOutsideType,
    modifier,
    selectionType,
    position,
  } = target;
  const modifiers: ModifierV2[] = [];

  if (position && position !== "contents") {
    if (position === "before") {
      if (insideOutsideType === "inside") {
        modifiers.push({ type: "position", position: "start" });
      } else if (action === "remove") {
        modifiers.push({ type: "leading" });
      } else {
        modifiers.push({ type: "position", position: "before" });
      }
    } else {
      if (insideOutsideType === "inside") {
        modifiers.push({ type: "position", position: "end" });
      } else if (action === "remove") {
        modifiers.push({ type: "trailing" });
      } else {
        modifiers.push({ type: "position", position: "after" });
      }
    }
  }

  if (selectionType) {
    switch (selectionType) {
      case "token":
        if (modifier?.type === "subpiece") {
          break;
        }
      // fallthrough
      case "line":
        if (mark?.type === "lineNumber") {
          break;
        }
      // fallthrough
      default:
        modifiers.push({
          type: "containingScope",
          scopeType: { type: selectionType },
        });
    }
  }

  if (modifier) {
    modifiers.push(...upgradeModifier(modifier));
  }

  return {
    type,
    isImplicit,
    // Empty array of modifiers is not allowed
    modifiers: modifiers.length > 0 ? modifiers : undefined,
    // Cursor token is just cursor position but treated as a token. This is done in the pipeline for normal cursor now
    mark: mark?.type === "cursorToken" ? undefined : mark,
  };
}

function upgradeTarget(
  target: PartialTargetV0V1,
  action: ActionType,
): PartialTargetDescriptorV2 {
  switch (target.type) {
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (target) =>
            upgradeTarget(target, action) as
              | PartialPrimitiveTargetDescriptorV2
              | PartialRangeTargetDescriptorV2,
        ),
      };
    case "range": {
      const { type, rangeType, start, end, excludeStart, excludeEnd } = target;
      return {
        type,
        rangeType,
        anchor: upgradePrimitiveTarget(start, action),
        active: upgradePrimitiveTarget(end, action),
        excludeAnchor: excludeStart ?? false,
        excludeActive: excludeEnd ?? false,
      };
    }
    case "primitive":
      return upgradePrimitiveTarget(target, action);
  }
}

function upgradeTargets(
  partialTargets: PartialTargetV0V1[],
  action: ActionType,
): PartialTargetDescriptorV2[] {
  return partialTargets
    .map((target) => upgradeTarget(target, action))
    .map((target) =>
      target.type === "primitive" ? upgradeStrictHere(target) : target,
    );
}
