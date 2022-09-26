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

  const oldModifiers = modifiers
    .map((m, i) => ({ index: i, modifier: m as OrdinalRangeModifier }))
    .filter((m) => m.modifier.type === "ordinalRange");
  const oldRangeModifiers = oldModifiers.filter(
    ({ modifier }) => modifier.anchor !== modifier.active
  );

  if (oldModifiers.length === 0) {
    return target;
  }

  if (oldRangeModifiers.length > 0) {
    if (
      // Can't create multiple range targets
      oldRangeModifiers.length > 1 ||
      // Can't create range target with additional ordinal modifiers
      oldModifiers.length > 1 ||
      // Primitive target is required but we have a range modifier
      requirePrimitive
    ) {
      throw Error("Can't support nested range targets");
    }

    return createRangeTarget(
      target,
      oldRangeModifiers[0].index,
      oldRangeModifiers[0].modifier
    );
  }

  oldModifiers.forEach(({ modifier, index }) => {
    target.modifiers![index] = createAbsoluteOrdinalModifier(
      modifier.scopeType,
      modifier.anchor
    );
  });

  return target;
}

function createRangeTarget(
  target: PartialPrimitiveTargetDescriptor,
  modifierIndex: number,
  modifier: OrdinalRangeModifier
): PartialRangeTargetDescriptor {
  target.modifiers![modifierIndex] = createAbsoluteOrdinalModifier(
    modifier.scopeType,
    modifier.anchor
  );

  const activeModifiers = [...target.modifiers!];
  activeModifiers[modifierIndex] = createAbsoluteOrdinalModifier(
    modifier.scopeType,
    modifier.active
  );

  const active = { ...target, modifiers: activeModifiers };

  return {
    type: "range",
    anchor: target,
    active,
    excludeAnchor: modifier.excludeAnchor ?? false,
    excludeActive: modifier.excludeActive ?? false,
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
