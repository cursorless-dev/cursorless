import {
  BringMoveActionDescriptor,
  DestinationDescriptor,
  InsertionMode,
  PartialListTargetDescriptor,
  PartialRangeTargetDescriptor,
  PlaceholderMark,
  PrimitiveDestinationDescriptor,
  type ContainingScopeModifier,
  type Modifier,
  type PartialMark,
  type PartialPrimitiveTargetDescriptor,
  type PartialTargetDescriptor,
  type ScopeType,
  type SimpleActionDescriptor,
  type SimpleActionName,
  type SimplePartialMark,
  type SimpleScopeType,
  type SimpleScopeTypeType,
  type SurroundingPairName,
  type SurroundingPairScopeType,
} from "@cursorless/common";

export function simpleActionDescriptor(
  name: SimpleActionName,
  target: PartialTargetDescriptor,
): SimpleActionDescriptor {
  return { name, target };
}

export function bringMoveActionDescriptor(
  name: BringMoveActionDescriptor["name"],
  source: PartialTargetDescriptor,
  destination: DestinationDescriptor,
): BringMoveActionDescriptor {
  return { name, source, destination };
}

export function partialPrimitiveTargetDescriptor(
  modifiers?: Modifier[],
  mark?: PartialMark,
): PartialPrimitiveTargetDescriptor {
  const target: PartialPrimitiveTargetDescriptor = { type: "primitive" };
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
  target:
    | PartialPrimitiveTargetDescriptor
    | PartialListTargetDescriptor
    | PartialRangeTargetDescriptor,
): PrimitiveDestinationDescriptor {
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

export function createPlaceholderMark(index: number): PlaceholderMark {
  return { type: "placeholder", index };
}
