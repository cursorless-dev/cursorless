import { Position } from "./Position";
import { Range } from "./Range";
import { TextEditor } from "./TextEditor";

export interface LineRange {
  type: "line";
  start: number;
  /**
   * Last line, inclusive
   */
  end: number;
}

export interface CharacterRange {
  type: "character";
  start: Position;
  end: Position;
}

export type GeneralizedRange = CharacterRange | LineRange;

export interface EditorGeneralizedRange {
  editor: TextEditor;
  range: GeneralizedRange;
}

export function isLineRange(range: GeneralizedRange): range is LineRange {
  return range.type === "line";
}

export function toLineRange(range: Range): LineRange {
  return { type: "line", start: range.start.line, end: range.end.line };
}

export function toCharacterRange({ start, end }: Range): CharacterRange {
  return { type: "character", start, end };
}
