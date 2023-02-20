import { ScopeType } from "../../../../common/types/command/PartialTargetDescriptor.types";

export function scopeTypeToString(scopeType: ScopeType) {
  return scopeType.type;
}
