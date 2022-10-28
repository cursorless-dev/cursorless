import { Position, Range } from "vscode";
import { Direction } from "../../../typings/targetDescriptor.types";
import { TargetScope } from "./scope.types";

export function compareTargetScopes(
  direction: Direction,
  position: Position,
  { domain: a }: TargetScope,
  { domain: b }: TargetScope,
): number {
  return direction === "forward"
    ? compareTargetScopesForward(position, a, b)
    : compareTargetScopesBackward(position, a, b);
}

function compareTargetScopesForward(
  position: Position,
  a: Range,
  b: Range,
): number {
  const aIsStartVisible = a.start.isAfterOrEqual(position);
  const bIsStartVisible = b.start.isAfterOrEqual(position);

  if (aIsStartVisible && bIsStartVisible) {
    const value = a.start.compareTo(b.start);

    return value === 0 ? a.end.compareTo(b.end) : value;
  }

  if (!aIsStartVisible && !bIsStartVisible) {
    const value = a.end.compareTo(b.end);

    return value === 0 ? -a.start.compareTo(b.start) : value;
  }

  if (!aIsStartVisible && bIsStartVisible) {
    const value = a.end.compareTo(b.start);

    return value !== 0 ? value : b.isEmpty ? 1 : -1;
  }

  const value = a.start.compareTo(b.end);

  return value !== 0 ? value : a.isEmpty ? -1 : 1;
}

function compareTargetScopesBackward(
  position: Position,
  a: Range,
  b: Range,
): number {
  const aIsEndVisible = a.end.isBeforeOrEqual(position);
  const bIsEndVisible = b.end.isBeforeOrEqual(position);

  if (aIsEndVisible && bIsEndVisible) {
    const value = -a.end.compareTo(b.end);

    return value === 0 ? -a.start.compareTo(b.start) : value;
  }

  if (!aIsEndVisible && !bIsEndVisible) {
    const value = -a.start.compareTo(b.start);

    return value === 0 ? a.end.compareTo(b.end) : value;
  }

  if (!aIsEndVisible && bIsEndVisible) {
    const value = -a.start.compareTo(b.end);

    return value !== 0 ? value : b.isEmpty ? 1 : -1;
  }

  const value = -a.end.compareTo(b.start);

  return value !== 0 ? value : a.isEmpty ? -1 : 1;
}
