import { Position } from "vscode";
import { Direction } from "../../../typings/targetDescriptor.types";
import { TargetScope } from "./scope.types";

export function compareTargetScopes(
  direction: Direction,
  position: Position,
  { domain: a }: TargetScope,
  { domain: b }: TargetScope): number {
  const aContainsPosition = a.contains(position);
  const bContainsPosition = b.contains(position);
  const multiplier = direction === "forward" ? 1 : -1;
  const [proximalAttribute, distalAttribute] = direction === "forward"
    ? (["start", "end"] as const)
    : (["end", "start"] as const);

  if (aContainsPosition && bContainsPosition) {
    const value = multiplier * a[distalAttribute].compareTo(b[distalAttribute]);

    if (value === 0) {
      return -multiplier * a[proximalAttribute].compareTo(b[proximalAttribute]);
    }

    return value;
  }

  const aPosition = aContainsPosition
    ? a[distalAttribute]
    : a[proximalAttribute];
  const bPosition = bContainsPosition
    ? b[distalAttribute]
    : b[proximalAttribute];

  return multiplier * aPosition.compareTo(bPosition);
}
