import { isEqual } from "lodash";
import { CommandV2 } from "@cursorless/common";
import { CommandV3 } from "@cursorless/common";
import {
  LineNumberMarkV3,
  MarkV3,
  ModifierV3,
  OrdinalScopeModifierV3,
  PartialPrimitiveTargetDescriptorV3,
  PartialRangeTargetDescriptorV3,
  PartialTargetDescriptorV3,
  RangeMarkV3,
  RangeModifierV3,
} from "@cursorless/common";
import {
  LineNumberMarkV2,
  LineNumberPositionV2,
  MarkV2,
  ModifierV2,
  OrdinalRangeModifierV2,
  PartialPrimitiveTargetDescriptorV2,
  PartialTargetDescriptorV2,
  ScopeTypeV2,
} from "@cursorless/common";

export function upgradeV2ToV3(command: CommandV2): CommandV3 {
  return {
    ...command,
    version: 3,
    targets: command.targets.map(upgradeTarget),
  };
}

function upgradeTarget(
  target: PartialTargetDescriptorV2,
): PartialTargetDescriptorV3 {
  switch (target.type) {
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (target) =>
            upgradeTarget(target) as
              | PartialPrimitiveTargetDescriptorV3
              | PartialRangeTargetDescriptorV3,
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
  target: PartialPrimitiveTargetDescriptorV2,
): PartialPrimitiveTargetDescriptorV3 {
  return {
    ...target,
    mark: target.mark != null ? updateMark(target.mark) : undefined,
    modifiers:
      target.modifiers != null
        ? target.modifiers.map(updateModifier)
        : undefined,
  };
}

function updateMark(mark: MarkV2): MarkV3 {
  switch (mark.type) {
    case "lineNumber":
      return createLineNumberMark(mark);
    default:
      return mark as MarkV3;
  }
}

function updateModifier(modifier: ModifierV2): ModifierV3 {
  switch (modifier.type) {
    case "ordinalRange":
      return createOrdinalModifier(modifier);
    default:
      return modifier as ModifierV3;
  }
}

function createLineNumberMark(
  mark: LineNumberMarkV2,
): LineNumberMarkV3 | RangeMarkV3 {
  if (isEqual(mark.anchor, mark.active)) {
    return createLineNumberMarkFromPos(mark.anchor);
  }

  return {
    type: "range",
    anchor: createLineNumberMarkFromPos(mark.anchor),
    active: createLineNumberMarkFromPos(mark.active),
  };
}

function createOrdinalModifier(
  modifier: OrdinalRangeModifierV2,
): OrdinalScopeModifierV3 | RangeModifierV3 {
  if (modifier.anchor === modifier.active) {
    return createAbsoluteOrdinalModifier(modifier.scopeType, modifier.anchor);
  }

  return {
    type: "range",
    anchor: createAbsoluteOrdinalModifier(modifier.scopeType, modifier.anchor),
    active: createAbsoluteOrdinalModifier(modifier.scopeType, modifier.active),
    excludeAnchor: modifier.excludeAnchor,
    excludeActive: modifier.excludeActive,
  };
}

function createLineNumberMarkFromPos(
  position: LineNumberPositionV2,
): LineNumberMarkV3 {
  return {
    type: "lineNumber",
    lineNumberType: position.type,
    lineNumber: position.lineNumber,
  };
}

function createAbsoluteOrdinalModifier(
  scopeType: ScopeTypeV2,
  start: number,
): OrdinalScopeModifierV3 {
  return {
    type: "ordinalScope",
    scopeType,
    start,
    length: 1,
  };
}
