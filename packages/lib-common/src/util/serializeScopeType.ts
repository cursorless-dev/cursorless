import { capitalize } from "lodash-es";
import type {
  ScopeType,
  ScopeTypeType,
  SimpleScopeTypeType,
} from "../types/command/PartialTargetDescriptor.types";
import { camelCaseToAllDown } from "./stringUtils";

export function serializeScopeType(
  scopeType: SimpleScopeTypeType | ScopeType,
): ScopeTypeType {
  if (typeof scopeType === "string") {
    return scopeType;
  }
  return scopeType.type;
}

export function prettifyScopeType(
  scopeType: SimpleScopeTypeType | ScopeType,
): string {
  return capitalize(camelCaseToAllDown(serializeScopeType(scopeType)));
}
