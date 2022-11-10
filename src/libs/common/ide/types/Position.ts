export default interface Position {
  /**
   * The zero-based line value.
   */
  readonly line: number;

  /**
   * The zero-based character value.
   */
  readonly character: number;

  /**
   * Check if this position is equal to `other`.
   *
   * @param other A position.
   * @return `true` if the line and character of the given position are equal to
   * the line and character of this position.
   */
  isEqual(other: Position): boolean;

  /**
   * Check if this position is before `other`.
   *
   * @param other A position.
   * @return `true` if position is on a smaller line
   * or on the same line on a smaller character.
   */
  isBefore(other: Position): boolean;

  /**
   * Check if this position is before or equal to `other`.
   *
   * @param other A position.
   * @return `true` if position is on a smaller line
   * or on the same line on a smaller or equal character.
   */
  isBeforeOrEqual(other: Position): boolean;

  /**
   * Check if this position is after `other`.
   *
   * @param other A position.
   * @return `true` if position is on a greater line
   * or on the same line on a greater character.
   */
  isAfter(other: Position): boolean;

  /**
   * Check if this position is after or equal to `other`.
   *
   * @param other A position.
   * @return `true` if position is on a greater line
   * or on the same line on a greater or equal character.
   */
  isAfterOrEqual(other: Position): boolean;
}
