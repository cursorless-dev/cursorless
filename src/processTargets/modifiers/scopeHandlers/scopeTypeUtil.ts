import { ScopeType } from "../../../core/commandRunner/typings/targetDescriptor.types";

export function scopeTypeToString(scopeType: ScopeType) {
  return scopeType.type;
}
