import type {
  ScopeType,
  ScopeTypeType,
  SimpleScopeTypeType,
} from "../types/command/PartialTargetDescriptor.types";

export function serializeScopeType(
  scopeType: SimpleScopeTypeType | ScopeType,
): ScopeTypeType {
  if (typeof scopeType === "string") {
    return scopeType;
  }
  return scopeType.type;
}
