import { isEqual } from "lodash";
import {
  AbsoluteOrdinalScopeModifier,
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
  OrdinalRangeModifier,
  PartialPrimitiveTargetDescriptorV2,
  PartialTargetDescriptorV2,
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
  oldModifier: OrdinalRangeModifier
): AbsoluteOrdinalScopeModifier | RangeModifier {
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

function createLineNumberMarkFromPos(
  position: LineNumberPositionV2
): LineNumberMark {
  return {
    type: "lineNumber",
    lineType: position.type,
    lineNumber: position.lineNumber,
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
