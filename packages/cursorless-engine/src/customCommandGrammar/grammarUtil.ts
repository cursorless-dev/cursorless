import type {
  BringMoveActionDescriptor,
  ContainingScopeModifier,
  DestinationDescriptor,
  Direction,
  InsertionMode,
  Modifier,
  PartialListTargetDescriptor,
  PartialMark,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
  PartialTargetMark,
  PrimitiveDestinationDescriptor,
  RelativeScopeModifier,
  ScopeType,
  SimpleActionDescriptor,
  SimpleActionName,
  SimplePartialMark,
  SimpleScopeType,
  SimpleScopeTypeType,
  SurroundingPairName,
  SurroundingPairScopeType,
} from "@cursorless/common";
import type { WithPlaceholders } from "./WithPlaceholders";

export function simpleActionDescriptor(
  name: SimpleActionName,
  target: WithPlaceholders<PartialTargetDescriptor>,
): WithPlaceholders<SimpleActionDescriptor> {
  return { name, target };
}

export function bringMoveActionDescriptor(
  name: BringMoveActionDescriptor["name"],
  source: WithPlaceholders<PartialTargetDescriptor>,
  destination: WithPlaceholders<DestinationDescriptor>,
): WithPlaceholders<BringMoveActionDescriptor> {
  return { name, source, destination };
}

export function partialPrimitiveTargetDescriptor(
  modifiers: Modifier[] | undefined,
  mark: WithPlaceholders<PartialMark> | undefined,
): WithPlaceholders<PartialPrimitiveTargetDescriptor> {
  const target: WithPlaceholders<PartialPrimitiveTargetDescriptor> = {
    type: "primitive",
  };
  if (modifiers != null) {
    target.modifiers = modifiers;
  }
  if (mark != null) {
    target.mark = mark;
  }
  return target;
}

export function primitiveDestinationDescriptor(
  insertionMode: InsertionMode,
  target: WithPlaceholders<
    | PartialPrimitiveTargetDescriptor
    | PartialListTargetDescriptor
    | PartialRangeTargetDescriptor
  >,
): WithPlaceholders<PrimitiveDestinationDescriptor> {
  return { type: "primitive", insertionMode, target };
}

export function containingScopeModifier(
  scopeType: ScopeType,
): ContainingScopeModifier {
  return {
    type: "containingScope",
    scopeType,
  };
}

export function relativeScopeModifier(
  scopeType: ScopeType,
  direction: Direction,
): RelativeScopeModifier {
  return {
    type: "relativeScope",
    scopeType,
    offset: 1,
    length: 1,
    direction,
  };
}

export function simpleScopeType(type: SimpleScopeTypeType): SimpleScopeType {
  return { type };
}

export function surroundingPairScopeType(
  delimiter: SurroundingPairName,
): SurroundingPairScopeType {
  return { type: "surroundingPair", delimiter };
}

export function simplePartialMark(
  type: SimplePartialMark["type"],
): SimplePartialMark {
  return { type };
}

export function createPlaceholderTarget(
  index: string,
): WithPlaceholders<PartialTargetMark> {
  return {
    type: "target",
    target: {
      type: "placeholder",
      index: index.length === 0 ? 0 : parseInt(index) - 1,
    },
  };
}
