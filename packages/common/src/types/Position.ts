import { Range, TextDocument } from "..";

export class Position {
  /**
   * The zero-based line value.
   */
  public readonly line: number;

  /**
   * The zero-based character value.
   */
  public readonly character: number;

  /**
   * @param line A zero-based line value.
   * @param character A zero-based character value.
   */
  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }

  /**
   * Check if this position is equal to `other`.
   *
   * @param other A position.
   * @return `true` if the line and character of the given position are equal to
   * the line and character of this position.
   */
  public isEqual(other: Position): boolean {
    return this.line === other.line && this.character === other.character;
  }

  /**
   * Check if this position is before `other`.
   *
   * @param other A position.
   * @return `true` if position is on a smaller line
   * or on the same line on a smaller character.
   */
  public isBefore(other: Position): boolean {
    if (this.line < other.line) {
      return true;
    }
    if (this.line > other.line) {
      return false;
    }
    return this.character < other.character;
  }

  /**
   * Check if this position is after `other`.
   *
   * @param other A position.
   * @return `true` if position is on a greater line
   * or on the same line on a greater character.
   */
  public isAfter(other: Position): boolean {
    if (this.line > other.line) {
      return true;
    }
    if (this.line < other.line) {
      return false;
    }
    return this.character > other.character;
  }

  /**
   * Check if this position is before or equal to `other`.
   *
   * @param other A position.
   * @return `true` if position is on a smaller line
   * or on the same line on a smaller or equal character.
   */
  public isBeforeOrEqual(other: Position): boolean {
    return this.isEqual(other) || this.isBefore(other);
  }

  /**
   * Check if this position is after or equal to `other`.
   *
   * @param other A position.
   * @return `true` if position is on a greater line
   * or on the same line on a greater or equal character.
   */
  public isAfterOrEqual(other: Position): boolean {
    return this.isEqual(other) || this.isAfter(other);
  }

  /**
   * Compare this to `other`.
   *
   * @param other A position.
   * @return A number smaller than zero if this position is before the given position,
   * a number greater than zero if this position is after the given position, or zero when
   * this and the given position are equal.
   */
  public compareTo(other: Position): number {
    if (this.isBefore(other)) {
      return -1;
    }
    if (this.isAfter(other)) {
      return 1;
    }
    return 0;
  }

  /**
   * Create a new position derived from this position.
   *
   * @param line Value that should be used as line value, default is the {@link Position.line existing value}
   * @param character Value that should be used as character value, default is the {@link Position.character existing value}
   * @return A position where line and character are replaced by the given values.
   */
  public with(line?: number, character?: number): Position {
    return new Position(line ?? this.line, character ?? this.character);
  }

  /**
   * Create a new position relative to this position.
   *
   * @param lineDelta Delta value for the line value, default is `0`.
   * @param characterDelta Delta value for the character value, default is `0`.
   * @return A position which line and character is the sum of the current line and
   * character and the corresponding deltas.
   */
  public translate(lineDelta?: number, characterDelta?: number): Position {
    return new Position(
      this.line + (lineDelta ?? 0),
      this.character + (characterDelta ?? 0),
    );
  }

  /**
   * Create a new empty range from this position.
   * @returns A {@link Range}
   */
  public toEmptyRange(): Range {
    return new Range(this, this);
  }

  /**
   * Return a concise string representation of the position.
   * @returns concise representation
   **/
  public concise(): string {
    return `${this.line}:${this.character}`;
  }

  public toString(): string {
    return this.concise();
  }
}

/**
 * adjustPosition returns a new position that is offset by the given amount.
 * It corrects line and character positions to remain valid in doc.
 * @param doc The document
 * @param pos The position to adjust
 * @param by The amount to adjust by
 * @returns The adjusted position
 */
export function adjustPosition(
  doc: TextDocument,
  pos: Position,
  by: number,
): Position {
  return doc.positionAt(doc.offsetAt(pos) + by);
}
