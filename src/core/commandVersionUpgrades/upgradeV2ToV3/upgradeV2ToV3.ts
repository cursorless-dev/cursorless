import { isEqual } from "lodash";
import {
  OrdinalScopeModifier,
  LineNumberMark,
  Mark,
  Modifier,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
  RangeMark,
  RangeModifier,
} from "../../../typings/targetDescriptor.types";
import { CommandV3 } from "../../commandRunner/command.types";
import { CommandV2 } from "./commandV2.types";
import {
  LineNumberMarkV2,
  LineNumberPositionV2,
  MarkV2,
  ModifierV2,
  OrdinalRangeModifierV2,
  PartialPrimitiveTargetDescriptorV2,
  PartialTargetDescriptorV2,
  ScopeTypeV2,
} from "./targetDescriptorV2.types";

export function upgradeV2ToV3(command: CommandV2): CommandV3 {
  return {
    ...command,
    version: 3,
    targets: command.targets.map(upgradeTarget),
  };
}

function upgradeTarget(
  target: PartialTargetDescriptorV2
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
  target: PartialPrimitiveTargetDescriptorV2
): PartialPrimitiveTargetDescriptor {
  return {
    ...target,
    mark: target.mark != null ? updateMark(target.mark) : undefined,
    modifiers:
      target.modifiers != null
        ? target.modifiers.map(updateModifier)
        : undefined,
  };
}

function updateMark(mark: MarkV2): Mark {
  switch (mark.type) {
    case "lineNumber":
      return createLineNumberMark(mark);
    default:
      return mark as Mark;
  }
}

function updateModifier(modifier: ModifierV2): Modifier {
  switch (modifier.type) {
    case "ordinalRange":
      return createOrdinalModifier(modifier);
    default:
      return modifier as Modifier;
  }
}

function createLineNumberMark(
  mark: LineNumberMarkV2
): LineNumberMark | RangeMark {
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
  modifier: OrdinalRangeModifierV2
): OrdinalScopeModifier | RangeModifier {
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
  position: LineNumberPositionV2
): LineNumberMark {
  return {
    type: "lineNumber",
    lineNumberType: position.type,
    lineNumber: position.lineNumber,
  };
}

function createAbsoluteOrdinalModifier(
  scopeType: ScopeTypeV2,
  start: number
): OrdinalScopeModifier {
  return {
    type: "ordinalScope",
    scopeType,
    start,
    length: 1,
  };
}
