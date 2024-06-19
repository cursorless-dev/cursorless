import {
  type ContainingScopeModifier,
  type Modifier,
  type PartialPrimitiveTargetDescriptor,
  type PartialTargetDescriptor,
  type ScopeType,
  type SimpleActionDescriptor,
  type SimpleActionName,
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

export function partialPrimitiveTargetDescriptor(
  modifier: Modifier,
): PartialPrimitiveTargetDescriptor {
  return {
    type: "primitive",
    modifiers: [modifier],
  };
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
