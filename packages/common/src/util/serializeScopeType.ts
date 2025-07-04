import type {
  ScopeType,
  SimpleScopeTypeType,
} from "../types/command/PartialTargetDescriptor.types";

export function serializeScopeType(
  scopeType: SimpleScopeTypeType | ScopeType,
): string {
  if (typeof scopeType === "string") {
    return scopeType;
  }
  return scopeType.type;
}
