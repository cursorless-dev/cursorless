import { ActionType } from "../../../actions/actions.types";
import {
  AbsoluteOrdinalScopeModifier,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
} from "../../../typings/targetDescriptor.types";
import { CommandV3 } from "../../commandRunner/command.types";
import { CommandV2 } from "./commandV2.types";
import {
  ModifierV2,
  OrdinalRangeModifier,
  ScopeType,
} from "./targetDescriptorV2.types";

export function upgradeV2ToV3(command: CommandV2): CommandV3 {
  return {
    version: 3,
    spokenForm: command.spokenForm,
    usePrePhraseSnapshot: command.usePrePhraseSnapshot,
    action: {
      name: command.action.name as ActionType,
      args: command.action.args,
    },
    targets: command.targets.map(upgradeTarget),
  };
}

function upgradeTarget(
  target: PartialTargetDescriptor
): PartialTargetDescriptor {
  switch (target.type) {
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (target) =>
            upgradeTarget(target) as
              | PartialPrimitiveTargetDescriptor
              | PartialRangeTargetDescriptor
        ),
      };
    case "range": {
      const { anchor, active, ...rest } = target;
      return {
        anchor: upgradePrimitiveTarget(
          anchor,
          true
        ) as PartialPrimitiveTargetDescriptor,
        active: upgradePrimitiveTarget(
          active,
          true
        ) as PartialPrimitiveTargetDescriptor,
        ...rest,
      };
    }
    case "primitive":
      return upgradePrimitiveTarget(target, false);
  }
}

function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetDescriptor,
  requirePrimitive: boolean
): PartialPrimitiveTargetDescriptor | PartialRangeTargetDescriptor {
  if (target.modifiers == null) {
    return target;
  }

  const modifiers = target.modifiers as ModifierV2[];
  const ordinalRangeIndex = modifiers.findIndex(
    (m) => m.type === "ordinalRange"
  );

  if (ordinalRangeIndex < 0) {
    return target;
  }

  const oldModifier = modifiers[ordinalRangeIndex] as OrdinalRangeModifier;

  target.modifiers[ordinalRangeIndex] = createAbsoluteOrdinalModifier(
    oldModifier.scopeType,
    oldModifier.anchor
  );

  if (oldModifier.anchor === oldModifier.active) {
    return target;
  }

  // Primitive target is required but we have a range modifier
  if (requirePrimitive) {
    throw Error("Can't support nested range targets");
  }

  const activeModifiers = [...target.modifiers];
  activeModifiers[ordinalRangeIndex] = createAbsoluteOrdinalModifier(
    oldModifier.scopeType,
    oldModifier.active
  );

  const active = { ...target, modifiers: activeModifiers };

  return {
    type: "range",
    anchor: target,
    active,
    excludeAnchor: oldModifier.excludeAnchor ?? false,
    excludeActive: oldModifier.excludeActive ?? false,
  };
}

function createAbsoluteOrdinalModifier(
  scopeType: ScopeType,
  start: number
): AbsoluteOrdinalScopeModifier {
  return {
    type: "absoluteOrdinalScope",
    scopeType,
    start,
    length: 1,
  };
}
