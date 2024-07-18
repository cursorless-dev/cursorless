import { Position } from "../types/Position";
import { Range } from "../types/Range";
import { Selection } from "../types/Selection";
import type {
  PositionPlainObject,
  RangePlainObject,
  SelectionPlainObject,
} from "../util/toPlainObject";

export function plainObjectToPosition({
  line,
  character,
}: PositionPlainObject): Position {
  return new Position(line, character);
}

export function plainObjectToRange({ start, end }: RangePlainObject): Range {
  return new Range(plainObjectToPosition(start), plainObjectToPosition(end));
}

export function plainObjectToSelection({
  anchor,
  active,
}: SelectionPlainObject): Selection {
  return new Selection(
    plainObjectToPosition(anchor),
    plainObjectToPosition(active),
  );
}
