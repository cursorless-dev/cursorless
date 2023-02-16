import { ScopeType } from "../../../core/commandRunner/typings/PartialTargetDescriptor.types";

export function scopeTypeToString(scopeType: ScopeType) {
  return scopeType.type;
}
