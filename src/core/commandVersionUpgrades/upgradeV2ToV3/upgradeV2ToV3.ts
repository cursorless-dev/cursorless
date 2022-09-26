import {
  AbsoluteOrdinalScopeModifier,
  Modifier,
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
    ...command,
    version: 3,
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
        anchor: upgradePrimitiveTarget(anchor),
        active: upgradePrimitiveTarget(active),
        ...rest,
      };
    }
    case "primitive":
      return upgradePrimitiveTarget(target);
  }
}

function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetDescriptor
): PartialPrimitiveTargetDescriptor {
  if (target.modifiers != null) {
    const modifiers = target.modifiers as ModifierV2[];
    for (let i = 0; i < modifiers.length; ++i) {
      const oldModifier = modifiers[i];
      if (oldModifier.type === "ordinalRange") {
        target.modifiers[i] = createNewModifier(oldModifier);
      }
    }
  }

  return target;
}

function createNewModifier(oldModifier: OrdinalRangeModifier): Modifier {
  if (oldModifier.anchor === oldModifier.active) {
    return createAbsoluteOrdinalModifier(
      oldModifier.scopeType,
      oldModifier.anchor
    );
  }

  return {
    type: "range",
    anchor: createAbsoluteOrdinalModifier(
      oldModifier.scopeType,
      oldModifier.anchor
    ),
    active: createAbsoluteOrdinalModifier(
      oldModifier.scopeType,
      oldModifier.active
    ),
    excludeAnchor: oldModifier.excludeAnchor,
    excludeActive: oldModifier.excludeActive,
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
