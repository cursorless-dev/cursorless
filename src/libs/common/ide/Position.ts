export default class Position {
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
}
